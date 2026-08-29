<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BackSide, Color, Vector4 } from 'three';

	import vertexShader from './vert.glsl?raw';
	import fragmentShader from './frag.glsl?raw';

	interface AuroraLayer {
		/** Center height of the band along latitude, roughly -1..1. 0 = horizon. */
		centerHeight: number;
		/** Band thickness. Must be > 0. Typical range: 0.05-0.4. */
		bandWidth: number;
		waveFrequency: number;
		longitudeOffset: number;
		/** Animation speed for this layer, relative to the `speed` prop. */
		timeScale: number;
		/** Base brightness. Kept small since it's accumulated via HDR. Typical range: 0.01-0.1. */
		brightness: number;
		foldIntensity: number;
		/** Layer-specific color override. Falls back to the global `color` prop when omitted. */
		color?: string;
	}

	interface Props {
		/** Radius of the aurora sphere. Increase if the camera is far away. @default 100 */
		readonly scale?: number;
		/** Final brightness multiplier applied before tone mapping. @default 0.4 */
		readonly intensity?: number;
		/** Global animation speed multiplier for all layers. @default 10 */
		readonly speed?: number;
		/** Base band color (hex string, e.g. "#22ff88"). @default '#ff2222' */
		readonly color?: string;
		/** Glow color at the brightest fold points. @default '#ff5555' */
		readonly foldColor?: string;
		/** Color shown where the first two layers overlap. @default '#ff0055' */
		readonly overlapColor?: string;
		/** Soft atmospheric glow color near the horizon. @default '#0000ff' */
		readonly glowColor?: string;
		/** Aurora layers. Capped at 8 (shader limit); extras are dropped with a console warning. */
		readonly layers?: AuroraLayer[];

		/** HDR-to-LDR tone mapping strength. Higher = brighter/more contrast. @default 1.35 */
		readonly exposure?: number;

		/** Frequency of the thin vertical ray streaks within the curtain. @default 6 */
		readonly rayFrequency?: number;
		/** Ray animation speed, relative to `speed`. @default 1 */
		readonly raySpeed?: number;
		/** Ray variation strength. 0 disables the effect. @default 0 */
		readonly rayIntensity?: number;

		/** `direction.y` value where the horizon fade begins (dimming). @default -0.75 */
		readonly horizonStart?: number;
		/** `direction.y` value where the aurora reaches full brightness. @default -0.02 */
		readonly horizonEnd?: number;
		/** Minimum brightness below the horizon, 0-1. @default 0.55 */
		readonly horizonFloor?: number;

		/** Latitude center of the atmospheric glow. @default 0.08 */
		readonly glowCenter?: number;
		/** Width of the atmospheric glow falloff. @default 0.2 */
		readonly glowWidth?: number;

		/** Dither strength to reduce banding in dark gradients. 0 disables it. Typical range: 0-0.01. @default 0.002 */
		readonly ditherStrength?: number;
	}

	const MAX_LAYERS = 8;

	let {
		scale = 100,
		intensity = 0.12,
		speed = 5,
		color = '#12688f',
		foldColor = '#d9f8ff',
		overlapColor = '#5fc9e8',
		glowColor = '#040a1a',
		layers = [
			{
				centerHeight: -0.4,
				bandWidth: 0.17,
				waveFrequency: 4.1,
				longitudeOffset: 0.6,
				timeScale: 0.4,
				brightness: 0.026,
				foldIntensity: 58,
				color: '#0d5c8f'
			},
			{
				centerHeight: 0.0,
				bandWidth: 0.6,
				waveFrequency: 5.7,
				longitudeOffset: 2.1,
				timeScale: 0.3,
				brightness: 0.028,
				foldIntensity: 50,
				color: '#1a8fb0'
			},
			{
				centerHeight: 0.4,
				bandWidth: 0.16,
				waveFrequency: 2.3,
				longitudeOffset: 3.7,
				timeScale: 0.6,
				brightness: 0.033,
				foldIntensity: 54,
				color: '#0a3550'
			}
		],
		exposure = 1.08,
		rayFrequency = 10,
		raySpeed = 0.5,
		rayIntensity = 0.22,
		horizonStart = -0.7,
		horizonEnd = -0.05,
		horizonFloor = 0.3,
		glowCenter = 0.1,
		glowWidth = 0.1,
		ditherStrength = 0.0025
	}: Props = $props();

	const layerShape = Array.from({ length: MAX_LAYERS }, () => new Vector4());
	const layerMotion = Array.from({ length: MAX_LAYERS }, () => new Vector4());
	const layerColorUniforms = Array.from({ length: MAX_LAYERS }, () => new Color());

	// layerShape = (centerHeight - bandWidth/2, bandWidth, waveFrequency, longitudeOffset)
	// layerMotion = (timeScale, brightness, foldIntensity, 0)
	function syncLayersToShader() {
		if (layers.length > MAX_LAYERS) {
			console.warn(`Aurora: Too many layers (${layers.length}). Capping at ${MAX_LAYERS}.`);
		}

		for (let i = 0; i < MAX_LAYERS; i++) {
			const layer = layers[i];

			if (!layer) {
				layerShape[i].set(0, 0, 0, 0);
				layerMotion[i].set(0, 0, 0, 0);
				layerColorUniforms[i].set(color);
				continue;
			}

			// Hindari width 0 -> div-by-zero (NaN) di shader
			const safeWidth = Math.max(layer.bandWidth, 0.001);

			layerShape[i].set(
				layer.centerHeight - safeWidth / 2,
				safeWidth,
				layer.waveFrequency,
				layer.longitudeOffset
			);

			layerMotion[i].set(layer.timeScale, layer.brightness, layer.foldIntensity, 0);
			layerColorUniforms[i].set(layer.color ?? color);
		}
	}

	syncLayersToShader();

	const uniforms = {
		time: { value: 0 },
		intensity: { value: (() => intensity)() },
		speed: { value: (() => speed)() },
		exposure: { value: (() => exposure)() },

		color: { value: new Color((() => color)()) },
		foldColor: { value: new Color((() => foldColor)()) },
		overlapColor: { value: new Color((() => overlapColor)()) },
		glowColor: { value: new Color((() => glowColor)()) },

		layerCount: { value: (() => Math.min(layers.length, MAX_LAYERS))() },
		layerShape: { value: layerShape },
		layerMotion: { value: layerMotion },
		layerColor: { value: layerColorUniforms },

		rayFrequency: { value: (() => rayFrequency)() },
		raySpeed: { value: (() => raySpeed)() },
		rayIntensity: { value: (() => rayIntensity)() },

		horizonStart: { value: (() => horizonStart)() },
		horizonEnd: { value: (() => horizonEnd)() },
		horizonFloor: { value: (() => horizonFloor)() },

		glowCenter: { value: (() => glowCenter)() },
		glowWidth: { value: (() => glowWidth)() },

		ditherStrength: { value: (() => ditherStrength)() }
	};

	$effect(() => {
		uniforms.intensity.value = intensity;
		uniforms.speed.value = speed;
		uniforms.exposure.value = exposure;

		uniforms.color.value.set(color);
		uniforms.foldColor.value.set(foldColor);
		uniforms.overlapColor.value.set(overlapColor);
		uniforms.glowColor.value.set(glowColor);

		uniforms.layerCount.value = Math.min(layers.length, MAX_LAYERS);

		uniforms.rayFrequency.value = rayFrequency;
		uniforms.raySpeed.value = raySpeed;
		uniforms.rayIntensity.value = rayIntensity;

		uniforms.horizonStart.value = horizonStart;
		uniforms.horizonEnd.value = horizonEnd;
		uniforms.horizonFloor.value = horizonFloor;

		uniforms.glowCenter.value = glowCenter;
		uniforms.glowWidth.value = glowWidth;

		uniforms.ditherStrength.value = ditherStrength;

		syncLayersToShader();
	});

	useTask(() => {
		uniforms.time.value = performance.now() * 0.001;
	});
</script>

<T.Mesh name="Aurora" {scale} renderOrder={-100}>
	<T.SphereGeometry args={[1, 64, 32]} />

	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		{uniforms}
		transparent
		side={BackSide}
		depthWrite={false}
		depthTest={false}
		fog={false}
	/>
</T.Mesh>
