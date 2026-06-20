<script lang="ts">
	import type { Mesh } from 'three';
	import {
		DoubleSide,
		ShaderMaterial,
		MathUtils,
		Vector3,
		Quaternion,
		Matrix4,
		PlaneGeometry,
		Euler
	} from 'three';
	import { Reflector } from 'three/addons/objects/Reflector.js';
	import { T, useTask } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	const PLANE: {
		pos: [number, number, number];
		rot: [number, number, number];
		size: [number, number];
	} = {
		pos: [0, 0.15, 0],
		rot: [Math.PI / 2, 0, 0],
		size: [10, 10]
	};
	const REFLECT: {
		pos: [number, number, number];
		rot: [number, number, number];
		size: [number, number];
		segments: number;
	} = {
		pos: [0, -0.15, 0],
		rot: [-Math.PI / 2, 0, 0],
		size: [10, 10],
		segments: 48
	};
	const WAVE: { amp: number; freq: number; speed: number; falloff: number } = {
		amp: 0.008,
		freq: 30,
		speed: 10,
		falloff: 2
	};
	const FLAP: { baseSpeed: number; speedFromVelocity: number; maxSpeed: number } = {
		baseSpeed: 4,
		speedFromVelocity: 8,
		maxSpeed: 10
	};
	const MOVE: {
		posSmoothing: number;
		rotSmoothing: number;
		bankStrength: number;
		maxBank: number;
		levelOutSmoothing: number;
		idleSpeedThreshold: number;
	} = {
		posSmoothing: 0.6,
		rotSmoothing: 5.0,
		bankStrength: 0.5,
		maxBank: 90,
		levelOutSmoothing: 4.0,
		idleSpeedThreshold: 0.2
	};
	const textureSize = Math.min(window.devicePixelRatio, 1.5) * 0.3;

	// -------------------------------------
	// Butterfly & Tracing
	// -------------------------------------
	const gltf = useGltf('/models/Butterfly-low.glb');
	let mesh = $state<Mesh | undefined>();
	const mat = new ShaderMaterial({
		side: DoubleSide,
		transparent: false,
		vertexShader: /* glsl */ `
      uniform float uTime;

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
        float timeBranch = uTime;

        vec3 scaledPos = post * vec3(1.0, 1.5, 1.0);
        float dist = length(scaledPos + vec3(0.0,1.5,0.0));
        float distanceBranch = dist * 0.3;

        float waveInput = timeBranch - distanceBranch;
        float wave = sin(waveInput) * 1.0;

        float sideMultiplier = (post.x > 0.0) ? 1.0 : -1.0;

        float finalAngle = wave * sideMultiplier;

        vec3 center = vec3(0.0, 0.0, -1.6);

        vec3 rotatedPosition = rotateZ(post, center, finalAngle);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(rotatedPosition, 1.0);
      }
    `,
		fragmentShader: /* glsl */ `
      void main() {
        gl_FragColor = vec4(0.4, 0.0, 0.0, 1.0);
      }
    `,
		uniforms: {
			uTime: { value: 0 }
		}
	});

	const BUTTERFLY_UP = new Vector3(0, 1, 0);
	const MODEL_CORRECTION = new Quaternion();
	const defaultDirection = new Vector3(0, 0, 1);
	const lastDirection = new Vector3().copy(defaultDirection);
	const target = new Vector3();
	const prevPosition = new Vector3();
	const velocity = new Vector3();
	const tmpQuat = new Quaternion();
	const finalQuat = new Quaternion();
	const bankQuat = new Quaternion();
	const lookMatrix = new Matrix4();
	const rightVec = new Vector3();
	const forwardVec = new Vector3();
	const handlePointerMove = (e: { point: Vector3 }) => target.copy(e.point);

	// -------------------------------------
	// Reflector
	// -------------------------------------
	let reflector = $state<Reflector>();
	let reflectorMaterial = $state<ShaderMaterial>();
	const geometry = new PlaneGeometry(
		REFLECT.size[0],
		REFLECT.size[1],
		REFLECT.segments,
		REFLECT.segments
	);
	const r = new Reflector(geometry, {
		clipBias: 0.01,
		textureWidth: Math.min(window.innerWidth * textureSize, 1280),
		textureHeight: Math.min(window.innerHeight * textureSize, 1280),
		color: 0x554455
	});

	const originalOnBeforeRender = r.onBeforeRender.bind(r);
	let shouldRenderReflection = true;

	const reflectorWorldMatrix = new Matrix4().compose(
		new Vector3(...REFLECT.pos),
		new Quaternion().setFromEuler(new Euler(...REFLECT.rot)),
		new Vector3(1, 1, 1)
	);
	const reflectorInverseMatrix = reflectorWorldMatrix.clone().invert();
	const localRippleOrigin = new Vector3();

	$effect(() => {
		const material = r.material as ShaderMaterial;
		material.uniforms.uTime = { value: 0 };
		material.uniforms.uWaveAmplitude = { value: WAVE.amp };
		material.uniforms.uWaveFrequency = { value: WAVE.freq };
		material.uniforms.uWaveFalloff = { value: WAVE.falloff };
		material.uniforms.uRippleOrigin = { value: new Vector3() };

		material.vertexShader = /* glsl */ `
			uniform mat4 textureMatrix;
			uniform float uTime;
			uniform float uWaveAmplitude;
			uniform float uWaveFrequency;
			uniform float uWaveFalloff;
			uniform vec3 uRippleOrigin;

			varying vec4 vUv;

			void main() {
				vec3 transformed = position;

				vec2 d = position.xy - uRippleOrigin.xy;
				float dist = length(d);

				float fade = 1.0 / (1.0 + dist * uWaveFalloff);
				float wave = sin(dist * uWaveFrequency - uTime) * fade;

				transformed.z += wave * uWaveAmplitude;

				vec4 pos4 = vec4(transformed, 1.0);
				vUv = textureMatrix * pos4;
				gl_Position = projectionMatrix * modelViewMatrix * pos4;
			}
		`;
		material.needsUpdate = true;

		reflector = r;
		reflectorMaterial = material;

		r.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
			if (shouldRenderReflection) {
				originalOnBeforeRender(renderer, scene, camera, geometry, material, group);
			}
		};

		return () => {
			r.geometry.dispose();
			material.dispose();
		};
	});

	// Update material parameter
	$effect(() => {
		if (!reflectorMaterial) return;
		reflectorMaterial.uniforms.uWaveAmplitude.value = WAVE.amp;
		reflectorMaterial.uniforms.uWaveFrequency.value = WAVE.freq;
		reflectorMaterial.uniforms.uWaveFalloff.value = WAVE.falloff;
	});

	// -------------------------------------
	// Task
	// -------------------------------------
	let frame = $state(0);
	const frameUpdateDistance = 3;
	useTask((delta) => {
		// -------------------------------------
		// Butterfly Tracing
		// -------------------------------------
		if (mesh) {
			prevPosition.copy(mesh.position);

			const t = 1 - Math.exp(-MOVE.posSmoothing * delta);
			mesh.position.lerp(target, t);

			velocity.subVectors(mesh.position, prevPosition).divideScalar(delta);
			const speed = velocity.length();

			if (speed > MOVE.idleSpeedThreshold) {
				lastDirection.copy(velocity).normalize();
			} else {
				const lt = 1 - Math.exp(-MOVE.levelOutSmoothing * delta);
				lastDirection.y = MathUtils.lerp(lastDirection.y, 0, lt);
				if (lastDirection.lengthSq() > 1e-6) {
					lastDirection.normalize();
				} else {
					lastDirection.copy(defaultDirection);
				}
			}

			lookMatrix.lookAt(new Vector3(), lastDirection, BUTTERFLY_UP);
			tmpQuat.setFromRotationMatrix(lookMatrix);
			tmpQuat.multiply(MODEL_CORRECTION);

			rightVec.set(1, 0, 0).applyQuaternion(tmpQuat);
			const lateralSpeed = velocity.dot(rightVec);
			const bankAngle = MathUtils.clamp(
				-lateralSpeed * MOVE.bankStrength,
				-MOVE.maxBank,
				MOVE.maxBank
			);

			forwardVec.set(0, 0, -1).applyQuaternion(tmpQuat);
			bankQuat.setFromAxisAngle(forwardVec, bankAngle);

			finalQuat.copy(tmpQuat).multiply(bankQuat);

			const rt = 1 - Math.exp(-MOVE.rotSmoothing * delta);
			mesh.quaternion.slerp(finalQuat, rt);

			const flapSpeed = Math.min(FLAP.baseSpeed + speed * FLAP.speedFromVelocity, FLAP.maxSpeed);
			mat.uniforms.uTime.value += delta * flapSpeed;
		}

		// -------------------------------------
		// Reflector
		// -------------------------------------
		if (reflector && reflectorMaterial) {
			frame++;
			shouldRenderReflection = frame % frameUpdateDistance === 0;

			reflectorMaterial.uniforms.uTime.value += delta * WAVE.speed;
			if (mesh) {
				localRippleOrigin.copy(mesh.position).applyMatrix4(reflectorInverseMatrix);
				reflectorMaterial.uniforms.uRippleOrigin.value.copy(localRippleOrigin);
			}
		}
	});
</script>

<!-- Hit-target raycast -->
<T.Mesh position={PLANE.pos} rotation={PLANE.rot} onpointermove={handlePointerMove}>
	<T.PlaneGeometry args={PLANE.size} />
	<T.MeshBasicMaterial
		transparent
		opacity={0.0}
		color={0x0000ff}
		side={DoubleSide}
		depthWrite={false}
	/>
</T.Mesh>

<!-- Main butterfly model -->
{#if $gltf}
	<T.Mesh
		bind:ref={mesh}
		geometry={$gltf.nodes.Butterfly.geometry}
		material={mat}
		position={[0, 0.2, 0.2]}
		scale={0.06}
	/>
{/if}

<!-- Reflector -->
{#if reflector}
	<T is={reflector} position={REFLECT.pos} rotation={REFLECT.rot} />
{/if}
