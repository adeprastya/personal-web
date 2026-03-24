<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { deviceData } from "$lib/device.svelte";
	import { scrollData } from "$lib/scroll.svelte";
	// Global
	import Camera from './Camera.svelte';
	import LaserCrosshair from "./LaserCrosshair.svelte";
	import HeroModel from './HeroModel.svelte';
  import CircleLine from './CircleLine.svelte';
	// Home
	import BracketText from './BracketText.svelte';
	
	const TEXT_CONFIGS = [
		{ text: "DESIGNING IDEAS THAT RESONATE BEYOND VISION", index: 1, y: 1 },
		{ text: "BLENDING LOGIC AND INTUITION WITH FUNCTION AND BEAUTY", index: 2, y: 0 },
		{ text: "A PURSUIT OF KNOWLEDGE FUELLED BY ENDLESS CURIOUSITY", index: 3, y: -1 }
	]

	const CIRCLE_CONFIGS = [
		{ radius: 0.5, segments: 32, color: "#777777" },
		{ radius: 0.9, segments: 44, color: "#666666" },
		{ radius: 1.4, segments: 60, color: "#555555" },
		{ radius: 2.0, segments: 64, color: "#444444" }
	]

	const { scene } = useThrelte();

	let circPositions = $state(new Map<string, [number, number, number]>())
	function getCircPos(i: number, y: number): [number, number, number] {
		const key = `${i}-${y}`
		if (!circPositions.has(key)) {
			const startAngle = 0.1
			const radius = 1.25
			const angle = startAngle + (i * Math.PI * 2) / 3
			circPositions.set(key, [
				radius * Math.cos(angle), 
				y, 
				radius * Math.sin(angle)
			])
		}
		return circPositions.get(key)!
	}

	onMount(() => {
		scene.background = new THREE.Color('#09090b')
	})

	let rotate = $derived(Math.round(scrollData.y * Math.PI * 2 * 100) / 100)
	let posY = $derived(Math.round((-1.0 + scrollData.y * 2) * 500) / 500)
	const worldCenterOffset = 0.2
	let worldCenter = $derived<[number, number, number]>([0, posY + worldCenterOffset, 0])

	const textStyle = {
		fontSize: deviceData.isMatchMediaMobile ? 0.05 : 0.038,
		width: deviceData.isMatchMediaMobile ? 1.0 : 0.7
	}
</script>

<Camera />

<T.AmbientLight intensity={0.025} color={0xffffff} />
<T.SpotLight 
	position={[0, 1, 1.5]} 
	castShadow 
	color={0xff0000} 
	intensity={100} 
	angle={Math.PI / 6} 
	penumbra={1} 
	decay={10} 
/>

<LaserCrosshair />

{#each CIRCLE_CONFIGS as config (config.radius)}
	<CircleLine radius={config.radius} y={0.9} segments={config.segments} color={config.color} />
	<CircleLine radius={config.radius} y={-0.9} segments={config.segments} color={config.color} />
{/each}

<T.Group rotation.y={rotate} position.y={posY}>
	<HeroModel />

	{#each TEXT_CONFIGS as textConfig (textConfig.text)}
		<BracketText 
			text={textConfig.text}
			fontSize={textStyle.fontSize}
			width={textStyle.width}
			position={getCircPos(textConfig.index, textConfig.y)}
			{worldCenter}
		/>
	{/each}
</T.Group>
