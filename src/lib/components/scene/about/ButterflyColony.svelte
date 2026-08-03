<script lang="ts">
	import {
		type BufferGeometry,
		type InstancedMesh,
		DoubleSide,
		ShaderMaterial,
		MathUtils,
		Vector3,
		Quaternion,
		Matrix4,
		Object3D,
		InstancedBufferAttribute
	} from 'three';
	import { T, useTask } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	import vert from '$lib/shaders/butterflyColony/vert.glsl?raw';
	import frag from '$lib/shaders/butterflyColony/frag.glsl?raw';

	/** Invisible raycast plane used to translate pointer movement into a 3D world position. */
	type Plane = {
		pos: [number, number, number];
		rot: [number, number, number];
		size: number;
		debug: boolean;
	};
	const plane: Plane = {
		pos: [0, 0, 0],
		rot: [Math.PI / 2 + Math.PI / 10, 0, 0],
		size: 5,
		debug: false
	};
	/** Wing-flap animation parameters, driven by per-instance velocity. */
	type Flap = {
		baseSpeed: number;
		speedFromVelocity: number;
		maxSpeed: number;
	};
	const flap: Flap = {
		baseSpeed: 4,
		speedFromVelocity: 8,
		maxSpeed: 10
	};
	/** Parameters controlling heading smoothing and banking during turns. */
	type Orientation = {
		rotSmoothing: number;
		bankStrength: number;
		maxBank: number;
	};
	const orientation: Orientation = {
		rotSmoothing: 5.0,
		bankStrength: 15,
		maxBank: 70
	};

	/** Flocking/boid parameters shared by every butterfly in the colony. */
	type Colony = {
		count: number;
		radius: number;
		wanderStrength: number;
		wanderJitter: number;
		spawnHeightJitter: number;
		seekStrength: number;
		centerSmoothing: number;
		maxSpeed: number;
		minSpeed: number;
		damping: number;
		eachSize: number;
	};
	const colony: Colony = {
		count: 50,
		radius: 0.4,
		wanderStrength: 1.2,
		wanderJitter: 0.4,
		spawnHeightJitter: 0.4,
		seekStrength: 1.8,
		centerSmoothing: 0.5,
		maxSpeed: 1.2,
		minSpeed: 0.25,
		damping: 0.4,
		eachSize: 0.025
	};

	const butterflyUp = new Vector3(0, 1, 0);
	const origin = new Vector3(0, 0, 0);
	// Applied after lookAt orientation to correct for the source model's default facing axis.
	const modelCorrection = new Quaternion();

	// =====================================
	// Per-instance state
	// =====================================

	/**
	 * Encapsulates the simulation state for a single butterfly instance.
	 * Replaces the previous parallel-array approach to avoid index-sync bugs
	 * and make it straightforward to add or remove per-instance fields.
	 */
	class Butterfly {
		position: Vector3;
		velocity: Vector3;
		lastDirection: Vector3;
		quaternion: Quaternion;
		wanderAngleXZ: number;
		wanderAngleY: number;

		constructor(center: Vector3) {
			const angle = Math.random() * Math.PI * 2;
			const r = Math.random() * colony.radius;

			this.position = new Vector3(
				center.x + Math.cos(angle) * r,
				center.y + (Math.random() - 0.5) * colony.spawnHeightJitter,
				center.z + Math.sin(angle) * r
			);
			this.velocity = new Vector3((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2);
			this.lastDirection = new Vector3(0, 0, 1);
			this.quaternion = new Quaternion();
			this.wanderAngleXZ = Math.random() * Math.PI * 2;
			this.wanderAngleY = Math.random() * Math.PI * 2;
		}
	}

	// Pre-allocated scratch objects reused across frames and instances to avoid per-frame garbage collection.
	const scratch = {
		wanderDir: new Vector3(),
		steer: new Vector3(),
		offset: new Vector3(),
		toCenter: new Vector3(),
		lastDir: new Vector3(),
		lookMatrix: new Matrix4(),
		tmpQuat: new Quaternion(),
		rightVec: new Vector3(),
		forwardVec: new Vector3(),
		bankQuat: new Quaternion(),
		finalQuat: new Quaternion(),
		dummy: new Object3D()
	};

	// =====================================
	// Simulation steps
	// =====================================

	// Advances the wander angles by a random increment and returns the resulting wander direction.
	function stepWander(b: Butterfly, delta: number): Vector3 {
		b.wanderAngleXZ += (Math.random() - 0.5) * colony.wanderJitter * delta;
		b.wanderAngleY += (Math.random() - 0.5) * colony.wanderJitter * 0.5 * delta;

		return scratch.wanderDir
			.set(Math.cos(b.wanderAngleXZ), Math.sin(b.wanderAngleY) * 0.6, Math.sin(b.wanderAngleXZ))
			.normalize();
	}

	// Computes the combined steering force for this frame: random wander
	function computeSteering(b: Butterfly, colonyCenter: Vector3, delta: number): Vector3 {
		const wanderDir = stepWander(b, delta);
		scratch.steer.copy(wanderDir).multiplyScalar(colony.wanderStrength);

		scratch.offset.subVectors(b.position, colonyCenter);
		const distFromCenter = scratch.offset.length();

		if (distFromCenter > colony.radius) {
			const over = distFromCenter - colony.radius;
			scratch.toCenter.copy(scratch.offset).normalize().multiplyScalar(-1);
			scratch.steer.addScaledVector(
				scratch.toCenter,
				colony.seekStrength * MathUtils.clamp(over / colony.radius, 0, 1.5)
			);
		}

		return scratch.steer;
	}

	// Integrates the steering force into velocity, applies damping and speed clamping, then advances position for this frame.
	function integrateMotion(b: Butterfly, steer: Vector3, delta: number) {
		b.velocity.addScaledVector(steer, delta);

		// Frame-rate independent exponential damping.
		const dampFactor = Math.pow(colony.damping, delta * 60);
		b.velocity.multiplyScalar(dampFactor);

		const speed = b.velocity.length();
		if (speed > colony.maxSpeed) {
			b.velocity.multiplyScalar(colony.maxSpeed / speed);
		} else if (speed > 1e-5 && speed < colony.minSpeed) {
			b.velocity.multiplyScalar(colony.minSpeed / speed);
		}

		b.position.addScaledVector(b.velocity, delta);
	}

	/**
	 * Derives a heading quaternion from the current direction of travel,
	 * applies a banking rotation proportional to lateral (turning) speed,
	 * and smoothly slerps the instance's stored quaternion toward it.
	 *
	 * Returns the current speed so callers can reuse it (e.g. for flap speed)
	 * without recomputing velocity.length().
	 */
	function updateOrientation(b: Butterfly, delta: number): number {
		const currSpeed = b.velocity.length();

		// Fall back to the last known direction when nearly stationary,
		// to avoid orientation snapping/flickering at very low speeds.
		if (currSpeed > 1e-4) {
			scratch.lastDir.copy(b.velocity).normalize();
			b.lastDirection.copy(scratch.lastDir);
		} else {
			scratch.lastDir.copy(b.lastDirection);
		}

		scratch.lookMatrix.lookAt(origin, scratch.lastDir, butterflyUp);
		scratch.tmpQuat.setFromRotationMatrix(scratch.lookMatrix);
		scratch.tmpQuat.multiply(modelCorrection);

		// Bank angle is proportional to how much velocity points sideways
		// relative to the current heading (i.e. how sharply the instance is turning).
		scratch.rightVec.set(1, 0, 0).applyQuaternion(scratch.tmpQuat);
		const lateralSpeed = b.velocity.dot(scratch.rightVec);
		const bankAngleDeg = MathUtils.clamp(
			-lateralSpeed * orientation.bankStrength,
			-orientation.maxBank,
			orientation.maxBank
		);

		scratch.forwardVec.set(0, 0, -1).applyQuaternion(scratch.tmpQuat);
		scratch.bankQuat.setFromAxisAngle(scratch.forwardVec, MathUtils.degToRad(bankAngleDeg));
		scratch.finalQuat.copy(scratch.tmpQuat).multiply(scratch.bankQuat);

		// Frame-rate independent exponential smoothing toward the target orientation.
		const rt = 1 - Math.exp(-orientation.rotSmoothing * delta);
		b.quaternion.slerp(scratch.finalQuat, rt);

		return currSpeed;
	}

	/** Writes the instance's transform into the InstancedMesh at the given index. */
	function writeInstanceMatrix(mesh: InstancedMesh, index: number, b: Butterfly) {
		scratch.dummy.position.copy(b.position);
		scratch.dummy.quaternion.copy(b.quaternion);
		scratch.dummy.scale.setScalar(colony.eachSize);
		scratch.dummy.updateMatrix();
		mesh.setMatrixAt(index, scratch.dummy.matrix);
	}

	// =====================================
	// Component state & lifecycle
	// =====================================

	const gltf = useGltf('/models/Butterfly-low.glb');

	let instancedMesh = $state<InstancedMesh>();
	let butterflyGeometry = $state<BufferGeometry>();

	let butterflies: Butterfly[] = [];
	let flapPhase: Float32Array = new Float32Array(0);
	let flapTimeAttr: InstancedBufferAttribute | undefined;

	const mat = new ShaderMaterial({
		side: DoubleSide,
		transparent: false,
		vertexShader: vert,
		fragmentShader: frag
	});

	// Target the colony steers toward (updated by pointer movement) and its smoothed current position (updated once per frame in the task loop).
	const pointerTarget = new Vector3(0, 0.2, 0.2);
	const colonyCenter = pointerTarget.clone();

	const handlePointerMove = (e: { point: Vector3 }) => pointerTarget.copy(e.point);

	/** Initializes the colony's instance state and per-instance flap phase buffer. */
	function spawnColony(center: Vector3) {
		butterflies = Array.from({ length: colony.count }, () => new Butterfly(center));
		flapPhase = new Float32Array(colony.count);
		for (let i = 0; i < colony.count; i++) {
			flapPhase[i] = Math.random() * Math.PI * 2;
		}
	}

	// Loads the butterfly geometry once the GLTF asset is available and (re)initializes the colony.
	$effect(() => {
		if (!$gltf) return;

		const geo = ($gltf.nodes.Butterfly.geometry as BufferGeometry).clone();
		spawnColony(colonyCenter);

		geo.setAttribute('aFlapTime', new InstancedBufferAttribute(flapPhase, 1));
		flapTimeAttr = geo.getAttribute('aFlapTime') as InstancedBufferAttribute;

		butterflyGeometry = geo;

		return () => {
			geo.dispose();
		};
	});

	// =====================================
	// Main simulation loop
	// =====================================

	useTask((delta) => {
		if (!instancedMesh || butterflies.length === 0) return;

		// Smoothly move the colony's effective center toward the pointer target,
		// rather than snapping to it, for a more natural following behavior.
		const centerT = 1 - Math.exp(-colony.centerSmoothing * delta);
		colonyCenter.lerp(pointerTarget, centerT);

		for (let i = 0; i < butterflies.length; i++) {
			const b = butterflies[i];

			const steer = computeSteering(b, colonyCenter, delta);
			integrateMotion(b, steer, delta);
			const currSpeed = updateOrientation(b, delta);

			writeInstanceMatrix(instancedMesh, i, b);

			// Flap speed scales with movement speed, capped at flap.maxSpeed.
			const flapSpeed = Math.min(
				flap.baseSpeed + currSpeed * flap.speedFromVelocity,
				flap.maxSpeed
			);
			flapPhase[i] += delta * flapSpeed;
		}

		instancedMesh.instanceMatrix.needsUpdate = true;
		if (flapTimeAttr) flapTimeAttr.needsUpdate = true;
	});
</script>

<!-- Invisible plane raycasting -->
<T.Mesh position={plane.pos} rotation={plane.rot} onpointermove={handlePointerMove}>
	<T.PlaneGeometry args={[plane.size, plane.size]} />
	<T.MeshBasicMaterial
		transparent
		opacity={plane.debug ? 0.15 : 0.0}
		color={0x0000ff}
		side={DoubleSide}
		depthWrite={false}
	/>
</T.Mesh>

<!-- Instanced butterfly colony -->
{#if butterflyGeometry}
	<T.InstancedMesh
		bind:ref={instancedMesh}
		args={[butterflyGeometry, mat, colony.count]}
		frustumCulled={false}
	/>
{/if}
