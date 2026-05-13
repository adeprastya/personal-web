<script lang="ts">
  import { T } from '@threlte/core';

  import HeroModel from './HeroModel.svelte';
  import CircleLine from './shared/CircleLine.svelte';
  import BracketText from './shared/BracketText.svelte';

  import { deviceData } from '$lib/contexts/device.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { scrollData } from '$lib/contexts/scroll.svelte';

	const texts = [
		{ text: 'DESIGNING IDEAS THAT RESONATE BEYOND VISION', index: 1, y: 1 },
		{ text: 'BLENDING LOGIC AND INTUITION WITH FUNCTION AND BEAUTY', index: 2, y: 0 },
		{ text: 'A PURSUIT OF KNOWLEDGE FUELLED BY ENDLESS CURIOUSITY', index: 3, y: -1 }
	];

	const textStyle = {
		fontSize: deviceData.isMatchMediaMobile ? 0.05 : 0.038,
		width: deviceData.isMatchMediaMobile ? 1.0 : 0.7
	};

	const circles = [
		{ radius: 0.5, segments: 32, color: '#777777' },
		{ radius: 0.9, segments: 44, color: '#666666' },
		{ radius: 1.4, segments: 60, color: '#555555' },
		{ radius: 2.0, segments: 64, color: '#444444' }
	];
	
	function getCircPos(i: number, y: number, radius: number): [number, number, number] {
		const startAngle = 0.1;
		const angle = startAngle + (i * Math.PI * 2) / 3;
		return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
	}

	let isHomePage = $derived(routeData.to === '/');

	let rotateY = $derived(Math.round(scrollData.y * Math.PI * 2 * 100) / 100);
	let positionY = $derived(isHomePage ? Math.round((-1.0 + scrollData.y * 2) * 500) / 500 : -1.0);
	let worldCenter = $derived<[number, number, number]>([0, positionY + 0.2, 0]);
</script>

{#each circles as c, i (i)}
	<CircleLine radius={c.radius} y={0.9} segments={c.segments} color={c.color} />
	<CircleLine radius={c.radius} y={-0.9} segments={c.segments} color={c.color} />
{/each}

<T.Group rotation.y={rotateY} position.y={positionY}>
	<HeroModel />

	{#each texts as t, i (i)}
		<BracketText
			text={t.text}
			fontSize={textStyle.fontSize}
			width={textStyle.width}
			position={getCircPos(t.index, t.y, 1.25)}
			{worldCenter}
			visible={isHomePage}
		/>
	{/each}
</T.Group>
