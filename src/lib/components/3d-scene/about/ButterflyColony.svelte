<script lang="ts">
	import type { BufferGeometry, InstancedMesh as ThreeInstancedMesh } from 'three';
	import {
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

	const PLANE: {
		pos: [number, number, number];
		rot: [number, number, number];
		size: number;
		debug: boolean;
	} = {
		pos: [0, 0, 0],
		rot: [Math.PI / 2 + Math.PI / 10, 0, 0],
		size: 5,
		debug: false
	};
	const FLAP: { baseSpeed: number; speedFromVelocity: number; maxSpeed: number } = {
		baseSpeed: 4,
		speedFromVelocity: 8,
		maxSpeed: 10
	};
	const MOVE_ROT: { rotSmoothing: number; bankStrength: number; maxBank: number } = {
		rotSmoothing: 5.0,
		bankStrength: 15,
		maxBank: 70
	};
	const COLONY: {
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
	} = {
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

	// -------------------------------------
	// Butterfly Colony (instanced)
	// -------------------------------------
	const gltf = useGltf('/models/Butterfly-low.glb');

	let instancedMesh = $state<ThreeInstancedMesh>();
	let butterflyGeometry = $state<BufferGeometry>();
	let flapTimeAttr: InstancedBufferAttribute | undefined;

	const mat = new ShaderMaterial({
		side: DoubleSide,
		transparent: true,
		vertexShader: /* glsl */ `
      attribute float aFlapTime;

      vec3 rotateZ(vec3 pos, vec3 center, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        vec3 p = pos - center;
        vec3 rotated = vec3(
          p.x * c - p.y * s,
          p.x * s + p.y * c,
          p.z
        );
        return rotated + center;
      }

      void main() {
        vec3 post = position;

        vec3 scaledPos = post * vec3(1.0, 1.5, 1.0);
        float dist = length(scaledPos + vec3(0.0, 1.5, 0.0));
        float distanceBranch = dist * 0.3;

        float waveInput = aFlapTime - distanceBranch;
        float wave = sin(waveInput) * 1.0;

        float sideMultiplier = (post.x > 0.0) ? 1.0 : -1.0;
        float finalAngle = wave * sideMultiplier;

        vec3 center = vec3(0.0, 0.0, -1.6);
        vec3 rotatedPosition = rotateZ(post, center, finalAngle);

        #ifdef USE_INSTANCING
          vec4 worldPos = instanceMatrix * vec4(rotatedPosition, 1.0);
        #else
          vec4 worldPos = vec4(rotatedPosition, 1.0);
        #endif

        gl_Position = projectionMatrix * modelViewMatrix * worldPos;
      }
    `,
		fragmentShader: /* glsl */ `
      void main() {
        gl_FragColor = vec4(1.0, 0.1, 0.1, 0.4);
      }
    `
	});

	const BUTTERFLY_UP = new Vector3(0, 1, 0);
	const ORIGIN = new Vector3(0, 0, 0);

	const MODEL_CORRECTION = new Quaternion();

	const pointerTarget = new Vector3(0, 0.2, 0.2);
	const colonyCenter = pointerTarget.clone();

	let positions: Vector3[] = [];
	let velocities: Vector3[] = [];
	let lastDirections: Vector3[] = [];
	let instanceQuats: Quaternion[] = [];
	let wanderAngleXZ: number[] = [];
	let wanderAngleY: number[] = [];
	let flapPhase: Float32Array = new Float32Array(0);

	const dummy = new Object3D();
	const wanderDir = new Vector3();
	const steer = new Vector3();
	const offsetFromCenter = new Vector3();
	const toCenter = new Vector3();
	const lookMatrix = new Matrix4();
	const tmpQuat = new Quaternion();
	const rightVec = new Vector3();
	const forwardVec = new Vector3();
	const bankQuat = new Quaternion();
	const finalQuat = new Quaternion();
	const lastDir = new Vector3();

	const handlePointerMove = (e: { point: Vector3 }) => pointerTarget.copy(e.point);

	$effect(() => {
		if (!$gltf) return;

		const geo = ($gltf.nodes.Butterfly.geometry as BufferGeometry).clone();
		const flapArray = new Float32Array(COLONY.count);
		geo.setAttribute('aFlapTime', new InstancedBufferAttribute(flapArray, 1));

		flapTimeAttr = geo.getAttribute('aFlapTime') as InstancedBufferAttribute;
		flapPhase = flapArray;

		positions = [];
		velocities = [];
		lastDirections = [];
		instanceQuats = [];
		wanderAngleXZ = [];
		wanderAngleY = [];

		for (let i = 0; i < COLONY.count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const r = Math.random() * COLONY.radius;

			positions.push(
				new Vector3(
					colonyCenter.x + Math.cos(angle) * r,
					colonyCenter.y + (Math.random() - 0.5) * COLONY.spawnHeightJitter,
					colonyCenter.z + Math.sin(angle) * r
				)
			);
			velocities.push(new Vector3((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2));
			lastDirections.push(new Vector3(0, 0, 1));
			instanceQuats.push(new Quaternion());
			wanderAngleXZ.push(Math.random() * Math.PI * 2);
			wanderAngleY.push(Math.random() * Math.PI * 2);
			flapArray[i] = Math.random() * Math.PI * 2;
		}

		butterflyGeometry = geo;

		return () => {
			geo.dispose();
		};
	});

	// -------------------------------------
	// Task
	// -------------------------------------
	useTask((delta) => {
		if (!instancedMesh || positions.length === 0) return;

		// Raycast pointer
		const ct = 1 - Math.exp(-COLONY.centerSmoothing * delta);
		colonyCenter.lerp(pointerTarget, ct);

		for (let i = 0; i < COLONY.count; i++) {
			const pos = positions[i];
			const vel = velocities[i];

			// Random wandering direction
			wanderAngleXZ[i] += (Math.random() - 0.5) * COLONY.wanderJitter * delta;
			wanderAngleY[i] += (Math.random() - 0.5) * COLONY.wanderJitter * 0.5 * delta;

			wanderDir
				.set(
					Math.cos(wanderAngleXZ[i]),
					Math.sin(wanderAngleY[i]) * 0.6,
					Math.sin(wanderAngleXZ[i])
				)
				.normalize();

			steer.copy(wanderDir).multiplyScalar(COLONY.wanderStrength);

			// Wandering boundary
			offsetFromCenter.subVectors(pos, colonyCenter);
			const distFromCenter = offsetFromCenter.length();
			if (distFromCenter > COLONY.radius) {
				const over = distFromCenter - COLONY.radius;
				toCenter.copy(offsetFromCenter).normalize().multiplyScalar(-1);
				steer.addScaledVector(
					toCenter,
					COLONY.seekStrength * MathUtils.clamp(over / COLONY.radius, 0, 1.5)
				);
			}

			vel.addScaledVector(steer, delta);

			// Damping velocity
			const dampFactor = Math.pow(COLONY.damping, delta * 60);
			vel.multiplyScalar(dampFactor);

			const speed = vel.length();
			if (speed > COLONY.maxSpeed) {
				vel.multiplyScalar(COLONY.maxSpeed / speed);
			} else if (speed > 1e-5 && speed < COLONY.minSpeed) {
				vel.multiplyScalar(COLONY.minSpeed / speed);
			}

			pos.addScaledVector(vel, delta);

			// Bank steering
			const currSpeed = vel.length();
			if (currSpeed > 1e-4) {
				lastDir.copy(vel).normalize();
				lastDirections[i].copy(lastDir);
			} else {
				lastDir.copy(lastDirections[i]);
			}

			lookMatrix.lookAt(ORIGIN, lastDir, BUTTERFLY_UP);
			tmpQuat.setFromRotationMatrix(lookMatrix);
			tmpQuat.multiply(MODEL_CORRECTION);

			rightVec.set(1, 0, 0).applyQuaternion(tmpQuat);
			const lateralSpeed = vel.dot(rightVec);
			const bankAngleDeg = MathUtils.clamp(
				-lateralSpeed * MOVE_ROT.bankStrength,
				-MOVE_ROT.maxBank,
				MOVE_ROT.maxBank
			);

			forwardVec.set(0, 0, -1).applyQuaternion(tmpQuat);
			bankQuat.setFromAxisAngle(forwardVec, MathUtils.degToRad(bankAngleDeg));
			finalQuat.copy(tmpQuat).multiply(bankQuat);

			const rt = 1 - Math.exp(-MOVE_ROT.rotSmoothing * delta);
			instanceQuats[i].slerp(finalQuat, rt);

			dummy.position.copy(pos);
			dummy.quaternion.copy(instanceQuats[i]);
			dummy.scale.setScalar(COLONY.eachSize);
			dummy.updateMatrix();
			instancedMesh.setMatrixAt(i, dummy.matrix);

			// Flap animation
			const flapSpeed = Math.min(
				FLAP.baseSpeed + currSpeed * FLAP.speedFromVelocity,
				FLAP.maxSpeed
			);
			flapPhase[i] += delta * flapSpeed;
		}

		instancedMesh.instanceMatrix.needsUpdate = true;
		if (flapTimeAttr) flapTimeAttr.needsUpdate = true;
	});
</script>

<!-- Hit-target raycast -->
<T.Mesh position={PLANE.pos} rotation={PLANE.rot} onpointermove={handlePointerMove}>
	<T.PlaneGeometry args={[PLANE.size, PLANE.size]} />
	<T.MeshBasicMaterial
		transparent
		opacity={PLANE.debug ? 0.15 : 0.0}
		color={0x0000ff}
		side={DoubleSide}
		depthWrite={false}
	/>
</T.Mesh>

<!-- Butterfly colony -->
{#if butterflyGeometry}
	<T.InstancedMesh
		bind:ref={instancedMesh}
		args={[butterflyGeometry, mat, COLONY.count]}
		frustumCulled={false}
	/>
{/if}
