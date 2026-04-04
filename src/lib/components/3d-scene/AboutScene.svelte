<script lang="ts">
	import { T } from '@threlte/core';
	import { deviceData } from '$lib/contexts/device.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { scrollData } from '$lib/contexts/scroll.svelte';
	import DiamondText from './shared/DiamondText.svelte';

	function getCircPos(i: number, y: number, radius: number): [number, number, number] {
		const startAngle = 0.1;
		const angle = startAngle + (i * Math.PI * 2) / 3;
		return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
	}

	let isAboutPage = $derived(routeData.to === '/about');
	let visibleText = $state(0);
	$effect(() => {
		if (!isAboutPage) visibleText = -1;
		visibleText = Math.floor(scrollData.y * 3);
	});
</script>

{#if isAboutPage}
	<T.PointLight position={[0, 4.0, 0]} color="#ff8888" intensity={2} distance={3} decay={0.1} />
{/if}

<DiamondText
	title="Ade Fathoni Prastya"
	description="A passionate software developer with deep interest in sustainable technology, creative design, and user-focused innovation."
	textWidth={deviceData.isMatchMediaMobile ? 0.8 : 1.6}
	fontSize={deviceData.isMatchMediaMobile ? 0.06 : 0.12}
	diamondPosition={getCircPos(1, 2.0, deviceData.isMatchMediaMobile ? 0.4 : 0.8)}
	diamondColor="#ff0000"
	textPosition={[0, 2.0, 0.25]}
	textColor="#ffffff"
	textIsVisible={visibleText === 0}
/>
<DiamondText
	title="faith"
	description="I believe in lifelong learning, collaborative growth, and continuous evolution both professionally and personally."
	textWidth={deviceData.isMatchMediaMobile ? 0.8 : 1.6}
	fontSize={deviceData.isMatchMediaMobile ? 0.06 : 0.12}
	diamondPosition={getCircPos(2, 2.0, deviceData.isMatchMediaMobile ? 0.4 : 0.8)}
	diamondColor="#ff0000"
	textPosition={[0, 2.0, 0.25]}
	textColor="#ffffff"
	textIsVisible={visibleText === 1}
/>
<DiamondText
	title="doctrine"
	description="I’m always inspired by visual arts, music, and movement while exploring the ways i can positively impact communities and environment."
	textWidth={deviceData.isMatchMediaMobile ? 0.8 : 1.6}
	fontSize={deviceData.isMatchMediaMobile ? 0.06 : 0.12}
	diamondPosition={getCircPos(3, 2.0, deviceData.isMatchMediaMobile ? 0.4 : 0.8)}
	diamondColor="#ff0000"
	textPosition={[0, 2.0, 0.25]}
	textColor="#ffffff"
	textIsVisible={visibleText === 2}
/>
