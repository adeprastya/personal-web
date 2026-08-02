<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import {
		BufferGeometry,
		BufferAttribute,
		AdditiveBlending,
		DynamicDrawUsage,
		ShaderMaterial,
		Points,
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

	let ready = $state(false);
	let mat = $state<ShaderMaterial | null>(null);
	// svelte-ignore non_reactive_update
	let points: Points | null = null;

	let positions: Float32Array;
	let velocities: Float32Array;
	let lifetimes: Float32Array;
	let phases: Float32Array;
	let posAttr: BufferAttribute;
	let lifeAttr: BufferAttribute;

	const randomize = (i: number) => {
		const b = i * 3;
		positions[b] = origin[0] + (Math.random() - 0.5) * spread[0];
		positions[b + 1] = origin[1] + (Math.random() - 0.5) * spread[1];
		positions[b + 2] = origin[2] + (Math.random() - 0.5) * spread[2];
		velocities[b] = (Math.random() - 0.5) * 0.008;
		velocities[b + 1] = Math.random() * 0.012 + 0.006;
		velocities[b + 2] = (Math.random() - 0.5) * 0.004;
		lifetimes[i] = Math.random();
	};

	$effect(() => {
		ready = false;

		positions = new Float32Array(count * 3);
		velocities = new Float32Array(count * 3);
		lifetimes = new Float32Array(count);
		phases = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			randomize(i);
			phases[i] = Math.random() * Math.PI * 2;
		}

		const geo = new BufferGeometry();
		posAttr = new BufferAttribute(positions, 3);
		lifeAttr = new BufferAttribute(lifetimes, 1);

		posAttr.usage = DynamicDrawUsage;
		lifeAttr.usage = DynamicDrawUsage;

		geo.setAttribute('position', posAttr);
		geo.setAttribute('aLife', lifeAttr);

		const [hR, hG, hB] = untrack(() => hotColor);
		const [cR, cG, cB] = untrack(() => coolColor);

		const newMat = new ShaderMaterial({
			vertexShader: /* gsls */ `
				attribute float aLife;
				varying float vLife;
				void main() {
					vLife = aLife;
					vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
					gl_PointSize = (1.0 - aLife) * 4.0 + 1.0;
					gl_Position = projectionMatrix * mvPos;
				}
			`,
			fragmentShader: /* gsls */ `
				uniform vec3 uHot;
				uniform vec3 uCool;
				varying float vLife;
				void main() {
					vec2 uv = gl_PointCoord - vec2(0.5);
					if (length(uv) > 0.5) discard;
					vec3 col = mix(uHot, uCool, vLife);
					float alpha = (1.0 - vLife) * 0.85;
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

		points = new Points(geo, newMat);
		mat = newMat;
		ready = true;

		return () => {
			ready = false;
			mat = null;
			points = null;
			geo.dispose();
			newMat.dispose();
		};
	});

	$effect(() => {
		if (!mat) return;
		mat.uniforms.uHot.value.set(...hotColor);
		mat.uniforms.uCool.value.set(...coolColor);
	});

	useTask(() => {
		if (!ready) return;

		const oy = origin[1];
		const invH = 1 / height;
		const maxY = oy + height;

		for (let i = 0; i < count; i++) {
			const b = i * 3;
			const life = lifetimes[i];

			positions[b] += velocities[b] + Math.sin(life * 8 + phases[i]) * 0.002;
			positions[b + 1] += velocities[b + 1];
			positions[b + 2] += velocities[b + 2] + Math.cos(life * 6 + phases[i]) * 0.002;

			lifetimes[i] = (positions[b + 1] - oy) * invH;

			if (positions[b + 1] > maxY) randomize(i);
		}

		posAttr.needsUpdate = true;
		lifeAttr.needsUpdate = true;
	});
</script>

{#if ready && points}
	<T is={points} />
{/if}
