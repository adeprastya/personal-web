<script lang="ts">
	import { T } from '@threlte/core';
	import { BackSide, MathUtils, Vector3 } from 'three';
	import vertexShader from '$lib/shaders/darkAmbientSky/vert.glsl?raw';
	import fragmentShader from '$lib/shaders/darkAmbientSky/frag.glsl?raw';

	interface Props {
		readonly turbidity?: number;
		readonly rayleigh?: number;
		readonly mieCoefficient?: number;
		readonly mieDirectionalG?: number;
		readonly elevation?: number;
		readonly azimuth?: number;
		readonly exposure?: number;
		readonly scale?: number;
	}
	let {
		turbidity = 0.02,
		rayleigh = 0.001,
		mieCoefficient = 0.9,
		mieDirectionalG = 0.9,
		elevation = 20,
		azimuth = 180,
		exposure = 0.1,
		scale = 100
	}: Props = $props();

	const geometryArgs = [1, 32, 15] as [number, number, number];
	const uniforms = {
		turbidity: { value: 0 },
		rayleigh: { value: 0 },
		mieCoefficient: { value: 0 },
		mieDirectionalG: { value: 0 },
		exposure: { value: 0 },
		sunPosition: { value: new Vector3() },
		up: { value: new Vector3(0, 1, 0) }
	};

	function syncSunPosition() {
		const phi = MathUtils.degToRad(90 - elevation);
		const theta = MathUtils.degToRad(azimuth);

		uniforms.sunPosition.value.setFromSphericalCoords(1, phi, theta);
	}

	function syncUniforms() {
		uniforms.turbidity.value = turbidity;
		uniforms.rayleigh.value = rayleigh;
		uniforms.mieCoefficient.value = mieCoefficient;
		uniforms.mieDirectionalG.value = mieDirectionalG;
		uniforms.exposure.value = exposure;

		syncSunPosition();
	}

	syncUniforms();
	// Sync uniforms only when props change.
	$effect(syncUniforms);
</script>

<T.Mesh name="Sky" {scale} renderOrder={-100}>
	<T.SphereGeometry args={geometryArgs} />

	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		{uniforms}
		side={BackSide}
		depthWrite={false}
		depthTest={false}
		fog={false}
	/>
</T.Mesh>
