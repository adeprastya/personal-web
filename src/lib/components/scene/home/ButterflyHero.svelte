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

	import vert from '$lib/shaders/butterflyHero/vert.glsl?raw';
	import frag from '$lib/shaders/butterflyHero/frag.glsl?raw';

	const viewport = useViewport();

	const debug = false;
	const planePosition: [number, number, number] = [0, 0, 0];
	const planeRotation: [number, number, number] = [0, 0, 0];

	// Reactive so the hit-target plane stays sized to the viewport on resize.
	const planeSize = $derived<[number, number]>([viewport.current.width, viewport.current.height]);

	/** Wing-flap animation parameters, driven by flight speed. */
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
	 * the idle threshold, faces the direction of travel. While idle, gradually
	 * levels out the vertical component of the last known direction.
	 */
	function updateFacingDirection(speed: number, delta: number) {
		if (speed > flight.idleSpeedThreshold) {
			lastDirection.copy(scratch.velocity).normalize();
		} else {
			const lt = 1 - Math.exp(-flight.levelOutSmoothing * delta);
			lastDirection.y = MathUtils.lerp(lastDirection.y, 0, lt);
			if (lastDirection.lengthSq() > 1e-6) {
				lastDirection.normalize();
			} else {
				lastDirection.copy(defaultDirection);
			}
		}
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

	/** Advances the flap animation's time uniform based on current speed. */
	function updateFlap(speed: number, delta: number) {
		const flapSpeed = Math.min(flap.baseSpeed + speed * flap.speedFromVelocity, flap.maxSpeed);
		mat.uniforms.uTime.value += delta * flapSpeed;
	}

	// =====================================
	// Main animation loop
	// =====================================

	useTask(function runFlapAnimation(delta) {
		if (!mesh || !meshPost) return;

		const { speed } = updatePosition(meshPost, delta);
		updateFacingDirection(speed, delta);
		updateOrientation(mesh, delta);
		updateFlap(speed, delta);
	});
</script>

<!-- Hit-target raycast -->
<T.Mesh position={planePosition} rotation={planeRotation} onpointermove={handlePointerMove}>
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
		<!-- Wing & look at manipulation -->
		<T.Mesh
			bind:ref={mesh}
			geometry={$gltf.nodes.Butterfly.geometry}
			material={mat}
			position={[0, 0.1, 0]}
			scale={0.16}
		/>
	</T.Group>
{/if}
