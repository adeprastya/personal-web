<script lang="ts">
	import {
		type Mesh,
		type Group,
		DoubleSide,
		FrontSide,
		ShaderMaterial,
		MathUtils,
		Vector3,
		Quaternion,
		Matrix4,
		Color
	} from 'three';
	import { T, useTask } from '@threlte/core';
	import { useGltf, useViewport } from '@threlte/extras';
	import { gsap } from 'gsap';

	import { asymmetricBell } from '$lib/utils/math/curve';
	import vert from '$lib/shaders/butterflyHero/vert.glsl?raw';
	import frag from '$lib/shaders/butterflyHero/frag.glsl?raw';

	const viewport = useViewport();

	const debug = false;
	const planePosition: [number, number, number] = [0, 0, 0];
	const planeRotation: [number, number, number] = [0, 0, 0];

	// Reactive so the hit-target plane stays sized to the viewport on resize.
	const planeSize = $derived<[number, number]>([viewport.current.width, viewport.current.height]);

	/** Wing-flap animation parameters, driven by flight speed and click-roll boost. */
	const flap = {
		baseSpeed: 4,
		speedFromVelocity: 8,
		maxSpeed: 10
	};

	/** Parameters controlling position/heading smoothing and banking during flight. */
	const flight = {
		posSmoothing: 0.6,
		rotSmoothing: 1.0,
		bankStrength: 0.5,
		maxBank: 45,
		levelOutSmoothing: 4.0,
		idleSpeedThreshold: 0.2
	};

	/** Parameters for the click-triggered barrel-roll animation. */
	const roll = {
		duration: 4,
		radius: 0.6,
		velocityThreshold: 0.05,
		flapBellPeak: 0.15,
		flapBellSigmaUp: 0.08,
		flapBellSigmaDown: 0.35,
		flapBoostMax: 20
	};

	const butterflyUp = new Vector3(0, 1, 0);
	const origin = new Vector3(0, 0, 0);

	// Applied after lookAt orientation to correct for the source model's default facing axis.
	// Currently identity; adjust if the imported mesh's forward axis does not match -Z.
	const modelCorrection = new Quaternion();

	const defaultDirection = new Vector3(0, 0, 1);

	// =====================================
	// Model & material
	// =====================================

	const gltf = useGltf('/models/Butterfly.glb');

	let meshPost = $state<Group | undefined>();
	let meshRoll = $state<Group | undefined>();
	let mesh = $state<Mesh | undefined>();

	const mat = new ShaderMaterial({
		side: DoubleSide,
		transparent: true,
		vertexShader: vert,
		fragmentShader: frag,
		uniforms: {
			uColor: { value: new Color(0xff2222) },
			uTime: { value: 0 },
			uSpeed: { value: 0.2 },
			uRough: { value: 0.6 },
			uMaxRadius: { value: 7 },
			uWaveCount: { value: 2.5 }
		}
	});

	$effect(function cleanupMaterial() {
		return () => mat.dispose();
	});

	// =====================================
	// Flight state
	// =====================================

	const lastDirection = new Vector3().copy(defaultDirection);
	const target = new Vector3();

	// Pre-allocated scratch objects reused across frames to avoid per-frame garbage collection.
	const scratch = {
		prevPosition: new Vector3(),
		velocity: new Vector3(),
		tmpQuat: new Quaternion(),
		finalQuat: new Quaternion(),
		bankQuat: new Quaternion(),
		lookMatrix: new Matrix4(),
		rightVec: new Vector3(),
		forwardVec: new Vector3()
	};

	const handlePointerMove = (e: { point: Vector3 }) => target.copy(e.point);

	/**
	 * Smoothly moves meshPost toward `target` and derives velocity/speed from
	 * the resulting displacement this frame.
	 */
	function updatePosition(group: Group, delta: number): { speed: number } {
		scratch.prevPosition.copy(group.position);

		const t = 1 - Math.exp(-flight.posSmoothing * delta);
		group.position.lerp(target, t);

		scratch.velocity.subVectors(group.position, scratch.prevPosition).divideScalar(delta);
		return { speed: scratch.velocity.length() };
	}

	/**
	 * Updates the "facing" direction used for orientation. While moving above
	 * the idle threshold, faces the direction of travel and records lateral
	 * (X) velocity for roll-direction detection. While idle, gradually levels
	 * out the vertical component of the last known direction.
	 */
	function updateFacingDirection(speed: number, delta: number): number {
		let currentVelocityX = 0;

		if (speed > flight.idleSpeedThreshold) {
			lastDirection.copy(scratch.velocity).normalize();
			currentVelocityX = scratch.velocity.x;
		} else {
			const lt = 1 - Math.exp(-flight.levelOutSmoothing * delta);
			lastDirection.y = MathUtils.lerp(lastDirection.y, 0, lt);
			if (lastDirection.lengthSq() > 1e-6) {
				lastDirection.normalize();
			} else {
				lastDirection.copy(defaultDirection);
			}
		}

		return currentVelocityX;
	}

	/**
	 * Derives a heading quaternion from `lastDirection`, applies a banking
	 * rotation proportional to lateral (turning) speed, and smoothly slerps
	 * the mesh's quaternion toward it.
	 */
	function updateOrientation(target: Mesh, delta: number) {
		scratch.lookMatrix.lookAt(origin, lastDirection, butterflyUp);
		scratch.tmpQuat.setFromRotationMatrix(scratch.lookMatrix);
		scratch.tmpQuat.multiply(modelCorrection);

		scratch.rightVec.set(1, 0, 0).applyQuaternion(scratch.tmpQuat);
		const lateralSpeed = scratch.velocity.dot(scratch.rightVec);
		const bankAngle = MathUtils.clamp(
			-lateralSpeed * flight.bankStrength,
			-flight.maxBank,
			flight.maxBank
		);

		scratch.forwardVec.set(0, 0, -1).applyQuaternion(scratch.tmpQuat);
		scratch.bankQuat.setFromAxisAngle(scratch.forwardVec, bankAngle);
		scratch.finalQuat.copy(scratch.tmpQuat).multiply(scratch.bankQuat);

		const rt = 1 - Math.exp(-flight.rotSmoothing * delta);
		target.quaternion.slerp(scratch.finalQuat, rt);
	}

	/** Advances the flap animation's time uniform based on current speed and roll boost. */
	function updateFlap(speed: number, flapBoost: number, delta: number) {
		const flapSpeed = Math.min(
			flap.baseSpeed + speed * flap.speedFromVelocity + flapBoost,
			flap.maxSpeed
		);
		mat.uniforms.uTime.value += delta * flapSpeed;
	}

	// =====================================
	// Click-triggered barrel roll
	// =====================================

	const rollState = {
		progress: { value: 0 },
		isAnimating: false,
		direction: 1,
		flapBoost: 0
	};
	let currentVelocityX = 0;
	let activeTimeline: gsap.core.Timeline | undefined;

	function handlePointerClick() {
		if (rollState.isAnimating || !meshRoll) return;

		rollState.isAnimating = true;
		rollState.progress.value = 0;
		rollState.direction =
			Math.abs(currentVelocityX) > roll.velocityThreshold
				? Math.sign(currentVelocityX)
				: Math.random() > 0.5
					? 1
					: -1;

		activeTimeline = gsap.timeline({
			onComplete: () => {
				rollState.isAnimating = false;
				rollState.flapBoost = 0;
			}
		});

		activeTimeline.to(rollState.progress, {
			value: 1,
			duration: roll.duration,
			ease: 'sine.inOut',
			onUpdate: () => {
				if (!meshRoll) return;

				const v = rollState.progress.value;
				const theta = v * Math.PI * 2 * rollState.direction;

				meshRoll.rotation.z = theta;
				meshRoll.position.x = Math.sin(theta) * roll.radius;
				meshRoll.position.y = (1 - Math.cos(theta)) * roll.radius;

				const bell = asymmetricBell(v, roll.flapBellPeak, roll.flapBellSigmaUp, roll.flapBellSigmaDown);
				rollState.flapBoost = bell * roll.flapBoostMax;
			}
		});
	}

	$effect(function cleanupTimeline() {
		return () => activeTimeline?.kill();
	});

	// =====================================
	// Main animation loop
	// =====================================

	useTask(function runFlapAnimation(delta) {
		if (!mesh || !meshPost) return;

		// While rolling, position/orientation are driven entirely by the GSAP
		// timeline (see handlePointerClick); only the flap animation continues here.
		if (rollState.isAnimating) {
			updateFlap(0, rollState.flapBoost, delta);
			return;
		}

		const { speed } = updatePosition(meshPost, delta);
		currentVelocityX = updateFacingDirection(speed, delta);
		updateOrientation(mesh, delta);
		updateFlap(speed, rollState.flapBoost, delta);
	});
</script>

<!-- Hit-target raycast -->
<T.Mesh
	position={planePosition}
	rotation={planeRotation}
	onpointermove={handlePointerMove}
	onclick={handlePointerClick}
>
	<T.PlaneGeometry args={planeSize} />
	<T.MeshBasicMaterial
		transparent
		opacity={debug ? 0.15 : 0.0}
		color={0x00ff00}
		side={FrontSide}
		depthWrite={false}
	/>
</T.Mesh>

<!-- Main butterfly model -->
{#if $gltf}
	<!-- Position manipulation -->
	<T.Group bind:ref={meshPost}>
		<T.Group bind:ref={meshRoll}>
			<!-- Wing & look at manipulation -->
			<T.Mesh
				bind:ref={mesh}
				geometry={$gltf.nodes.Butterfly.geometry}
				material={mat}
				position={[0, 0.1, 0]}
				scale={0.16}
			/>
		</T.Group>
	</T.Group>
{/if}
