<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import {
		AdditiveBlending,
		BufferAttribute,
		BufferGeometry,
		DynamicDrawUsage,
		Points,
		ShaderMaterial,
		Vector3
	} from 'three';
	import { untrack } from 'svelte';

	type Props = {
		count?: number;
		spread?: [number, number, number];
		height?: number;
		origin?: [number, number, number];
		hotColor?: [number, number, number];
		coolColor?: [number, number, number];
	};
	let {
		count = 50,
		spread = [6, 0, 2],
		height = 5,
		origin = [0, -2.5, 0],
		hotColor = [1.0, 0.85, 0.4],
		coolColor = [1.0, 0.27, 0.0]
	}: Props = $props();

	/** Base particle drift velocity. */
	const drift = {
		xRange: 0.008,
		yMin: 0.006,
		yRange: 0.012,
		zRange: 0.004
	};

	/** Additional horizontal motion layered on top of the base drift. */
	const wobble = {
		xFreq: 8,
		xAmp: 0.002,
		zFreq: 6,
		zAmp: 0.002
	};

	const fadeAlpha = 0.85;

	/** Indicates whether the particle system has been initialized. */
	let ready = $state(false);

	let material = $state<ShaderMaterial | null>(null);

	// svelte-ignore non_reactive_update
	let points: Points | null = null;

	/** Particle simulation buffers. */
	let positions: Float32Array;
	let velocities: Float32Array;
	let lifetimes: Float32Array;
	let phases: Float32Array;

	/** GPU attributes updated every frame. */
	let positionAttribute: BufferAttribute;
	let lifetimeAttribute: BufferAttribute;

	/** Respawns a particle at the emitter origin with a fresh velocity. */
	function spawnParticle(i: number) {
		const b = i * 3;

		positions[b] = origin[0] + (Math.random() - 0.5) * spread[0];
		positions[b + 1] = origin[1] + (Math.random() - 0.5) * spread[1];
		positions[b + 2] = origin[2] + (Math.random() - 0.5) * spread[2];

		velocities[b] = (Math.random() - 0.5) * drift.xRange;
		velocities[b + 1] = drift.yMin + Math.random() * drift.yRange;
		velocities[b + 2] = (Math.random() - 0.5) * drift.zRange;

		lifetimes[i] = Math.random();
	}

	/** Create particle buffers and rendering resources. */
	$effect(() => {
		ready = false;

		positions = new Float32Array(count * 3);
		velocities = new Float32Array(count * 3);
		lifetimes = new Float32Array(count);
		phases = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			spawnParticle(i);
			phases[i] = Math.random() * Math.PI * 2;
		}

		const geometry = new BufferGeometry();

		positionAttribute = new BufferAttribute(positions, 3);
		lifetimeAttribute = new BufferAttribute(lifetimes, 1);

		positionAttribute.usage = DynamicDrawUsage;
		lifetimeAttribute.usage = DynamicDrawUsage;

		geometry.setAttribute('position', positionAttribute);
		geometry.setAttribute('aLife', lifetimeAttribute);

		const [hR, hG, hB] = untrack(() => hotColor);
		const [cR, cG, cB] = untrack(() => coolColor);

		const newMaterial = new ShaderMaterial({
			vertexShader: /* glsl */ `
				attribute float aLife;
				varying float vLife;

				void main() {
					vLife = aLife;

					vec4 mvPos = modelViewMatrix * vec4(position, 1.0);

					gl_PointSize = (1.0 - aLife) * 4.0 + 1.0;
					gl_Position = projectionMatrix * mvPos;
				}
			`,
			fragmentShader: /* glsl */ `
				uniform vec3 uHot;
				uniform vec3 uCool;

				varying float vLife;

				void main() {
					vec2 uv = gl_PointCoord - vec2(0.5);

					if (length(uv) > 0.5) discard;

					vec3 col = mix(uHot, uCool, vLife);
					float alpha = (1.0 - vLife) * ${fadeAlpha.toFixed(2)};

					gl_FragColor = vec4(col, alpha);
				}
			`,
			uniforms: {
				uHot: { value: new Vector3(hR, hG, hB) },
				uCool: { value: new Vector3(cR, cG, cB) }
			},
			blending: AdditiveBlending,
			transparent: true,
			depthWrite: true
		});

		points = new Points(geometry, newMaterial);
		material = newMaterial;
		ready = true;

		return () => {
			ready = false;
			material = null;
			points = null;

			geometry.dispose();
			newMaterial.dispose();
		};
	});

	$effect(function syncUniforms() {
		if (!material) return;

		material.uniforms.uHot.value.set(...hotColor);
		material.uniforms.uCool.value.set(...coolColor);
	});

	useTask(function runAnimation() {
		if (!ready) return;

		const originY = origin[1];
		const maxY = originY + height;
		const invHeight = 1 / height;

		for (let i = 0; i < count; i++) {
			const b = i * 3;
			const life = lifetimes[i];

			positions[b] += velocities[b] + Math.sin(life * wobble.xFreq + phases[i]) * wobble.xAmp;
			positions[b + 1] += velocities[b + 1];
			positions[b + 2] +=
				velocities[b + 2] + Math.cos(life * wobble.zFreq + phases[i]) * wobble.zAmp;

			lifetimes[i] = (positions[b + 1] - originY) * invHeight;

			if (positions[b + 1] > maxY) {
				spawnParticle(i);
			}
		}

		positionAttribute.needsUpdate = true;
		lifetimeAttribute.needsUpdate = true;
	});
</script>

{#if ready && points}
	<T is={points} />
{/if}