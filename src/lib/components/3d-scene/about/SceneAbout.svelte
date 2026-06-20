<script lang="ts">
	import { T } from '@threlte/core';
	import { deviceData } from '$lib/contexts/device.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { dragProgress } from '$lib/contexts/dragProgress.svelte';
	import { AppRoute } from '$lib/types/Route';
	import DiamondText from '../shared/DiamondText.svelte';
	import ButterfliesColony from './ButterfliesColony.svelte';

	let progress = $derived(dragProgress.about);

	const isMobile = $derived(deviceData.isMatchMediaMobile);
	const isAboutPage = $derived(routeData.current === AppRoute.about);
	const visibleText = $derived(isAboutPage ? Math.floor(progress * 3) : -1);

	const textWidth = $derived(isMobile ? 1.6 : 2.0);
	const fontSize = $derived(isMobile ? 0.18 : 0.16);

	const texts = [
		{
			title: 'Ade Fathoni Prastya',
			description:
				'Passionate software developer with deep interest in sustainable technology, creative design, and user-focused innovation.'
		},
		{
			title: 'faith',
			description:
				'Believe in lifelong learning, collaborative growth, and continuous evolution both professionally and personally.'
		},
		{
			title: 'doctrine',
			description:
				'Always inspired by visual arts, music, and movement while exploring the ways i can positively impact communities and environment.'
		}
	];
</script>

<T.Group visible={isAboutPage}>
	{#each texts as text, i (i)}
		<DiamondText
			title={text.title}
			description={text.description}
			{textWidth}
			{fontSize}
			textPosition={[0, 0, 0]}
			textColor="#fefefe"
			textIsVisible={visibleText === i}
		/>
	{/each}

	<ButterfliesColony />
</T.Group>
