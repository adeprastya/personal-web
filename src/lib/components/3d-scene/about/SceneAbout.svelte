<script lang="ts">
	import { T } from '@threlte/core';
	import { deviceData } from '$lib/contexts/device.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { dragProgress } from '$lib/contexts/dragProgress.svelte';
	import { AppRoute } from '$lib/types/Route';
	import DiamondText from '../shared/DiamondText.svelte';

	let progress = $derived(dragProgress.about);

	function getCircPos(i: number, y: number, radius: number): [number, number, number] {
		const startAngle = 0.1;
		const angle = startAngle + (i * Math.PI * 2) / 3;
		return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
	}

	const isMobile = $derived(deviceData.isMatchMediaMobile);
	const isAboutPage = $derived(routeData.current === AppRoute.about);
	const visibleText = $derived(isAboutPage ? Math.floor(progress * 3) : -1);

	const radius = $derived(isMobile ? 0.7 : 1.0);
	const textWidth = $derived(isMobile ? 1.1 : 2.0);
	const fontSize = $derived(isMobile ? 0.12 : 0.16);

	const items = [
		{
			title: 'Ade Fathoni Prastya',
			description:
				'A passionate software developer with deep interest in sustainable technology, creative design, and user-focused innovation.'
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

<T.PointLight position={[0, 4.0, 0]} color="#ff8888" intensity={2} distance={3} decay={0.1} />

{#each items as item, i (i)}
	<DiamondText
		title={item.title}
		description={item.description}
		{textWidth}
		{fontSize}
		diamondPosition={getCircPos(i + 1, 2.0, radius)}
		diamondColor="#ff0000"
		textPosition={[0, 2.2, 0.25]}
		textColor="#ffffff"
		textIsVisible={visibleText === i}
	/>
{/each}
