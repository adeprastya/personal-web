<script lang="ts">
	import '../app.css';
	import { PUBLIC_ENV } from '$env/static/public';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { SplitText } from 'gsap/SplitText';

	import { typingAnimation } from '$lib/utils/typingAnimation';
	import { projects } from '$lib/stores/projects.svelte';
	import { route } from '$lib/state/route.svelte';
	import { device } from '$lib/state/device.svelte';
	import { pointer } from '$lib/state/pointer.svelte';
	import { drag } from '$lib/state/dragProgress.svelte';
	import { AppRoute } from '$lib/types/Route';
	import { activeProject } from '$lib/state/activeProject.svelte';

	import Intro from '$lib/components/Intro.svelte';
	import AppFrame from '$lib/components/frame/AppFrame.svelte';
	import ScrollToNext from '$lib/components/ScrollToNext.svelte';
	import WebGLCanvas from '$lib/components/3d-scene/Canvas.svelte';

	let { children } = $props();

	const TITLE = 'Ade Prastya';
	const DESC =
		"Hi! I'm Ade Fathoni Prastya — a passionate web developer. Explore my portfolio, the stories behind my work, and connect with me.";
	const URL = 'https://adefathoniprastya.vercel.app';
	const IMG = 'https://adefathoniprastya.vercel.app/og-image.jpg';
	const LANG = 'en';

	const routesDetail: Record<string, string> = {
		[AppRoute.Home]: 'Ade Prastya',
		[AppRoute.About]: "Don't know me?",
		[AppRoute.Works]: 'Hope you like it!'
	};
	const routes = Object.keys(routesDetail);

	$effect(() => {
		typingAnimation(
			routesDetail[route.from],
			routesDetail[route.to],
			(s: string) => (document.title = s || '|'),
			{ delay: 100 }
		);
	});

	onMount(() => {
		// Preload fetching projects data on initial load, used in works page
		projects.init();
		// Register runtime state
		route.init();
		device.init();
		pointer.init();
		drag.init(() => pointer.dy);
		activeProject.reset();
		// Register plugins
		gsap.registerPlugin(SplitText);

		return () => {
			device.destroy();
			pointer.destroy();
			drag.destroy();
		};
	});
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESC} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content={LANG} />
	<link rel="canonical" href={URL} />

	<meta property="og:site_name" content={TITLE} />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESC} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={URL} />
	<meta property="og:image" content={IMG} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESC} />
	<meta name="twitter:image" content={IMG} />

	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Ade Fathoni Prastya",
			"jobTitle": "Web Developer",
			"url": "https://adefathoniprastya.vercel.app",
			"sameAs": [
				"https://github.com/adeprastya",
				"https://www.linkedin.com/in/adefathoniprastya",
				"https://www.instagram.com/s.c.a.l.a.r"
			]
		}
	</script>
</svelte:head>

<div class="fixed z-10 size-full overflow-hidden">
	{#if browser}
		<WebGLCanvas />
	{/if}

	{@render children()}

	{#if PUBLIC_ENV === 'prod'}
		<Intro />
	{/if}

	<AppFrame />

	<ScrollToNext {routes} />
</div>
