<script lang="ts">
	import { PerspectiveCamera, ShaderMaterial, TextureLoader, type Texture } from 'three';
	import { T, useTask, useThrelte } from '@threlte/core';

	interface ProjectPlaneProps {
		imageUrl: string;
		isVisible: boolean;
		progress: number;
		onClick?: () => void;
	}
	let { imageUrl, isVisible = false, progress = 0, onClick }: ProjectPlaneProps = $props();

	const { camera } = useThrelte();
	const loader = new TextureLoader();
	loader.setCrossOrigin('anonymous');

	let myTexture = $state<Texture | null>(null);
	let material = $state<ShaderMaterial | null>(null);
	let time = $state(0);

	// Load texture
	$effect(() => {
		let isCancelled = false;
		// dummy for development
		// loader.load("/imgs/dummy.png", (tex) => {
		loader.load(imageUrl, (tex) => {
			if (!isCancelled) myTexture = tex;
		});

		return () => {
			isCancelled = true;
			myTexture?.dispose();
		};
	});

	// Sync uniforms
	$effect(() => {
		if (material && isVisible) {
			material.uniforms.uTexture.value = myTexture;
			material.uniforms.uProgress.value = progress;
			material.needsUpdate = true;
		}
	});

	// Calculate aspect ratio dan plane dimensions
	let aspect = $derived(myTexture ? myTexture.image.width / myTexture.image.height : 1);
	let planeDim = $derived.by(() => {
		const cam = $camera as PerspectiveCamera;
		if (!cam || !cam.fov) return { w: 1, h: 1 };

		const dist = 2.75; // Cam distance
		const h = 2 * Math.tan((cam.fov * Math.PI) / 360) * dist;
		const w = h * cam.aspect;

		// Like css "contain" logic
		return cam.aspect > aspect ? { w: h * aspect, h } : { w, h: w / aspect };
	});

	// Time increment
	useTask((delta) => {
		time += delta;
		if (material) {
			material.uniforms.uTime.value = time;
		}
	});

	const vertexShader = `
    precision highp float;

    // ===== NOISE UTILITIES ==============================
    // Random hash function
    float hash(vec3 p) {
      p = fract(p * 0.1031);
      p += dot(p, p.zyx + 31.32);
      return fract((p.x + p.y) * p.z);
    }
    // 3D Value Noise
    float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f); // Smoothstep interpolation

        return mix(
            mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    // Fractional Brownian Motion (FBM)
    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        // Layer 5 octaves of noise
        for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p * frequency);
            p *= 2.0;       // Double the frequency each octave
            amplitude *= 0.5; // Halve the amplitude each octave
        }
        return value;
    }
    // ===================================================

    varying vec2 vUv;
    varying float vNoise;
    uniform float uTime;
    uniform float uProgress;

    float DISPLACEMENT_POWER = 0.2;

    void main() {
        vUv = uv;
        vec3 pos = position;

        float n = fbm(vec3(pos.xy * 3.0, uTime * 0.2));
        float centeredNoise = n * 1.0 - 0.5;
        vNoise = n;

        // Displacement
        float power = DISPLACEMENT_POWER + (uProgress * 0.5);
        pos.z += centeredNoise * power;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

	const fragmentShader = `
    precision highp float;

    varying vec2 vUv;
    varying float vNoise;
    uniform sampler2D uTexture;
    uniform float uProgress;

    void main () {
      // RGB shift effect
      float baseIntensity = 0.002;
      float extraIntensity = 0.01;
      float extraPower = extraIntensity * sin(uProgress * 3.14159);
      float shiftPower = vNoise * (baseIntensity + extraPower);

      vec2 rOffset = vec2(shiftPower, 0.0);
      vec2 bOffset = vec2(-shiftPower, shiftPower * 0.5);

      vec4 texR = texture2D(uTexture, vUv + rOffset);
      vec4 texG = texture2D(uTexture, vUv);
      vec4 texB = texture2D(uTexture, vUv + bOffset);
      vec3 finalColor = vec3(texR.r, texG.g, texB.b);

      // Box fading effect
      float noiseEffect = vNoise * 0.4;
      float edgeFade = smoothstep(0.0, 0.1 + noiseEffect, vUv.x) * smoothstep(1.0, 0.9 - noiseEffect, vUv.x) *
                       smoothstep(0.0, 0.1 + noiseEffect, vUv.y) * smoothstep(1.0, 0.9 - noiseEffect, vUv.y);

      // Alpha noise blending effect
      float minAlpha = 0.6;
      float baseVisibility = 1.0 - uProgress;
      float organicAlpha = mix(minAlpha, 1.0, vNoise) * baseVisibility;

      // Final alpha
      float alpha = mix(0.0, organicAlpha, edgeFade);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

	const uniforms = {
		uTexture: { value: null as Texture | null },
		uProgress: { value: 0 },
		uTime: { value: 0 }
	};
</script>

<T.Mesh position={[0, 4, 0]} onpointerup={onClick} visible={isVisible}>
	<T.PlaneGeometry args={[planeDim.w, planeDim.h, 48, 48]} />
	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		transparent
		oncreate={(m) => {
			m.uniforms = uniforms;
			material = m;
		}}
	/>
</T.Mesh>
