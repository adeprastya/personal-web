<script lang="ts" module>
	function getCircPos(i: number, y: number, radius: number): [number, number, number] {
		const startAngle = 0.1;
		const angle = startAngle + (i * Math.PI * 2) / 3;
		return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
	}
</script>

<script lang="ts">
	import { T } from '@threlte/core';
	import { useViewport } from '@threlte/extras';

	import { deviceData } from '$lib/contexts/device.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { dragProgress } from '$lib/contexts/dragProgress.svelte';

	import CircleLine from '../shared/CircleLine.svelte';
	import BracketText from '../shared/BracketText.svelte';
	import Particles from './Particles.svelte';
	import ButterflyModel from './ButterflyModel.svelte';

	const viewport = useViewport();

	let progress = $derived(dragProgress.home);

	const CONFIG = {
		rotation: {
			start: 0,
			end: Math.PI * 2
		},
		position: {
			start: -1.5,
			end: 3.5
		},
		worldCenterOffset: 0.2,
		textRadius: 1.25
	};
	const circleSettings = [
		{ radius: 0.5, segments: 32, color: '#777777' },
		{ radius: 0.9, segments: 44, color: '#666666' },
		{ radius: 1.4, segments: 60, color: '#555555' },
		{ radius: 2.0, segments: 64, color: '#444444' }
	];
	const textItems = [
		{ text: 'DESIGNING IDEAS THAT RESONATE BEYOND VISION', index: 1, y: 1 },
		{ text: 'BLENDING LOGIC AND INTUITION WITH FUNCTION AND BEAUTY', index: 2, y: 0 },
		{ text: 'A PURSUIT OF KNOWLEDGE FUELLED BY ENDLESS CURIOUSITY', index: 3, y: -1 }
	];
	let textStyle = $derived({
		fontSize: deviceData.isMatchMediaMobile ? 0.05 : 0.038,
		width: deviceData.isMatchMediaMobile ? 1.0 : 0.7
	});
	let isHomePage = $derived(routeData.to === '/');

	// Transform calculations based on progress
	let transform = $derived({
		rotY: CONFIG.rotation.start + progress * CONFIG.rotation.end,
		posY: CONFIG.position.start + progress * CONFIG.position.end
	});
	let worldCenter = $derived<[number, number, number]>([
		0,
		transform.posY + CONFIG.worldCenterOffset,
		0
	]);
</script>

{#each circleSettings as c, i (i)}
	<CircleLine radius={c.radius} y={0.9} segments={c.segments} color={c.color} />
	<CircleLine radius={c.radius} y={-0.9} segments={c.segments} color={c.color} />
{/each}

<T.Group rotation.y={transform.rotY} position.y={transform.posY}>
	{#each textItems as t, i (i)}
		<BracketText
			text={t.text}
			fontSize={textStyle.fontSize}
			width={textStyle.width}
			position={getCircPos(t.index, t.y, CONFIG.textRadius)}
			{worldCenter}
			visible={isHomePage}
		/>
	{/each}
</T.Group>

<Particles
	origin={[0, -2.5, 0]}
	spread={[3, 1, 3]}
	height={6}
	count={80}
	hotColor={[1.0, 0.4, 0.2]}
	coolColor={[1.0, 0.0, 0.0]}
/>
<ButterflyModel
	planePosition={[0, 0, 0]}
	planeRotation={[0, 0, 0]}
	planeSize={[viewport.current.width, viewport.current.height]}
/>
