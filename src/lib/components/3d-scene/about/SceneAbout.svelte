<script lang="ts">
	import { MathUtils } from 'three';
	import { T } from '@threlte/core';
	import { deviceData } from '$lib/contexts/device.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { dragProgress } from '$lib/contexts/dragProgress.svelte';
	import { AppRoute } from '$lib/types/Route';
	import DiamondText from './DiamondText.svelte';
	import ButterflyColony from './ButterflyColony.svelte';

	let progress = $derived.by(() => {
		const raw = dragProgress.about * 3;
		return [
			MathUtils.mapLinear(raw, 0, 1, 0, 1),
			MathUtils.mapLinear(raw, 1, 2, 0, 1),
			MathUtils.mapLinear(raw, 2, 3, 0, 1)
		];
	});

	const isMobile = $derived(deviceData.isMatchMediaMobile);
	const isAboutPage = $derived(routeData.current === AppRoute.about);
	const textWidth = $derived(isMobile ? 1.6 : 2.0);
	const fontSize = $derived(isMobile ? 0.18 : 0.16);

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
</script>

<T.Group visible={isAboutPage} position={[0, 0, 0]}>
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
