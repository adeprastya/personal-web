<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { Color } from 'three';
	import { T, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';

	import { routeData } from '$lib/contexts/route.svelte';

	import Camera from './Camera.svelte';
	import LaserCrosshair from './LaserCrosshair.svelte';

	import HomeScene from './HomeScene.svelte';
	import AboutScene from './AboutScene.svelte';
	import WorksScene from './WorksScene.svelte';
	import Emberparticles from './EmberParticles.svelte';

	interactivity();

	const { scene } = useThrelte();

	const lightPos = new Tween<[number, number, number]>([0, 1.0, 1.5], {
		duration: 1000,
		easing: cubicOut
	});

	let isAboutPage = $derived(routeData.to === '/about');

	$effect(() => {
		if (isAboutPage) {
			lightPos.set([0, 1.0, 0.5]);
		} else {
			lightPos.set([0, 1.0, 1.5]);
		}
	});

	onMount(() => {
		scene.background = new Color('#09090b');
	});
</script>

<Camera />

<T.AmbientLight intensity={0.02} color="#ffffff" />
<T.SpotLight
	position={lightPos.current}
	castShadow
	color="#ff0000"
	intensity={100}
	angle={Math.PI / 6}
	penumbra={1}
	decay={10}
/>

<LaserCrosshair />

<HomeScene />
<AboutScene />
<WorksScene />

<Emberparticles
	origin={[0, -2, 0]}
	spread={[4, 0, 4]}
	height={8}
	count={100}
	hotColor={[1.0, 0.85, 0.4]}
	coolColor={[1.0, 0.27, 0.0]}
/>
