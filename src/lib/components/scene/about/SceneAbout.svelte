<script lang="ts">
	import { MathUtils, Color, Group } from 'three';
	import { AppRoute } from '$lib/types/AppRoute';
	import { T, useTask } from '@threlte/core';
	import { device } from '$lib/state/device.svelte';
	import { route } from '$lib/state/route.svelte';
	import { drag } from '$lib/state/dragControl.svelte';
	import DiamondText from './DiamondText.svelte';
	import ButterflyColony from './ButterflyColony.svelte';
	import CircleLine from '$lib/components/scene/shared/CircleLine.svelte';

	const isMobile = $derived(device.isMatchMediaMobile);
	const textWidth = $derived(isMobile ? 1.6 : 2.0);
	const fontSize = $derived(isMobile ? 0.18 : 0.16);

	// Split the progress for each text element
	let progress = $derived.by(() => {
		const raw = drag.is(AppRoute.About) * 3;
		return [
			MathUtils.mapLinear(raw, 0, 1, 0, 1),
			MathUtils.mapLinear(raw, 1, 2, 0, 1),
			MathUtils.mapLinear(raw, 2, 3, 0, 1)
		];
	});

	const texts = [
		{
			diamondPosition: [-1.2, 0.2, 0],
			title: 'Ade Fathoni Prastya',
			description:
				'Passionate software developer with deep interest in sustainable technology, creative design, and user-focused innovation.'
		},
		{
			diamondPosition: [1.2, 0, -0.8],
			title: 'faith',
			description:
				'Believe in lifelong learning, collaborative growth, and continuous evolution both professionally and personally.'
		},
		{
			diamondPosition: [0, -0.2, 0.8],
			title: 'doctrine',
			description:
				'Always inspired by visual arts, music, and movement while exploring the ways i can positively impact communities and environment.'
		}
	];

	const circColor = new Color('#fff');
	const circles = [
		{ radius: 0.5, segments: 32, color: circColor, opacity: 0.2 },
		{ radius: 0.9, segments: 44, color: circColor, opacity: 0.125 },
		{ radius: 1.4, segments: 60, color: circColor, opacity: 0.05 },
		{ radius: 2.0, segments: 64, color: circColor, opacity: 0.02 },
		{ radius: 2.7, segments: 64, color: circColor, opacity: 0.01 }
	];

	let circleRefs = $state<(Group | undefined)[]>([]);
	useTask((delta) => {
		for (const circ of circleRefs) {
			if (!circ) continue;
			circ.rotation.y += delta * 0.8;
		}
	});
</script>

<T.Group visible={route.is(AppRoute.About)} position={[0, 0, 0]}>
	{#each circles as setting, i (i)}
		<T.Group bind:ref={circleRefs[i]} rotation.z={0.05} rotation.y={i * 1.8}>
			<CircleLine {...setting} color={setting.color.clone()} y={-0.5} />
		</T.Group>
	{/each}

	{#each texts as text, i (i)}
		<DiamondText
			diamondPosition={text.diamondPosition as [number, number, number]}
			diamondColor="#dd0000"
			title={text.title}
			description={text.description}
			{textWidth}
			{fontSize}
			textPosition={[0, 0, 0]}
			textColor="#fefefe"
			progress={progress[i]}
		/>
	{/each}

	<ButterflyColony />
</T.Group>
