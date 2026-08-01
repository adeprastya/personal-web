<script lang="ts">
	import '../app.css';
	import { PUBLIC_ENV } from '$env/static/public';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { SplitText } from 'gsap/SplitText';

	import { AppStage } from '$lib/types/AppStage';
	import { AppRoute } from '$lib/types/AppRoute';
	import { typingAnimation } from '$lib/utils/typingAnimation';
	import { projects } from '$lib/stores/projects.svelte';
	import { route } from '$lib/state/route.svelte';
	import { device } from '$lib/state/device.svelte';
	import { pointer } from '$lib/state/pointer.svelte';
	import { drag } from '$lib/state/dragProgress.svelte';
	import { activeProject } from '$lib/state/activeProject.svelte';

	import Head from './Head.svelte';
	import Intro from '$lib/components/intro/Intro.svelte';
	import AppFrame from '$lib/components/frame/AppFrame.svelte';
	import ScrollToNext from '$lib/components/ScrollToNext.svelte';
	import WebGLCanvas from '$lib/components/3d-scene/Canvas.svelte';

	let { children } = $props();

	// Route title mapping.
	const routeTitles: Record<string, string> = {
		[AppRoute.Home]: 'Ade Prastya',
		[AppRoute.About]: "Don't know me?",
		[AppRoute.Works]: 'Hope you like it!'
	};
	$effect(function animateTitle() {
		typingAnimation(
			routeTitles[route.from],
			routeTitles[route.to],
			(s: string) => (document.title = s || '|'),
			{ delay: 100 }
		);
	});

	// Global data & state initialization.
	onMount(() => {
		// Initialize data.
		projects.init();

		// Initialize stores.
		route.init();
		device.init();
		pointer.init();
		drag.init(() => pointer.dy);
		activeProject.reset();

		// Register plugins.
		gsap.registerPlugin(SplitText);

		return () => {
			device.destroy();
			pointer.destroy();
			drag.destroy();
		};
	});
</script>

<Head />

<div class="fixed z-10 size-full overflow-hidden">
	{#if browser}
		<WebGLCanvas />
	{/if}

	{@render children()}

	{#if PUBLIC_ENV == AppStage.PRODUCTION}
		<Intro />
	{/if}

	<AppFrame />

	<ScrollToNext />
</div>
