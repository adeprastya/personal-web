<script lang="ts">
	import '../app.css';
	import { onMount } from "svelte";
	import { browser } from '$app/environment';
	import { initRoute, routeData } from "$lib/contexts/route.svelte";
	import { initDevice } from "$lib/contexts/device.svelte";
	import { initPointer } from "$lib/contexts/pointer.svelte";
	import { initScroll } from "$lib/contexts/scroll.svelte";
	import { typingAnimation } from "$lib/utils/textAnimation";
	import AppFrame from '$lib/components/frame/AppFrame.svelte';
	import WebGLCanvas from '$lib/components/3d-scene/Canvas.svelte';
	import ScrollToNext from "$lib/components/ScrollToNext.svelte";

	let { children } = $props();

	const TITLE = 'Ade Prastya';
	const DESC =
		"Hi! I'm Ade Fathoni Prastya — a passionate web developer. Explore my portfolio, the stories behind my work, and connect with me.";
	const URL = 'https://adefathoniprastya.vercel.app';
	const IMG = 'https://adefathoniprastya.vercel.app/og-image.jpg';
	const LANG = 'en';

	const routesDetail: Record<string, string> = {
		"/": "Ade Prastya",
		"/about": "Don't know me?",
		"/works": "Hope you like it!",
	};
	const routes = Object.keys(routesDetail);

	$effect(() => {
		typingAnimation(
			routesDetail[routeData.from || '/'],
			routesDetail[routeData.to || '/'],
			(s: string) => document.title = s || "|",
			{ delay: 100 }
		);
	})

	onMount(() => {
		const cleanups = [initRoute(), initDevice(), initScroll(), initPointer()];
		return () => cleanups.forEach((fn) => (typeof fn === 'function') && fn());
	})
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESC} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content={LANG} />
	<link rel="canonical" href={URL} />

	<meta property="og:site_name" content={TITLE}>
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
	<AppFrame />
	<ScrollToNext routes={routes} />
</div>

<main id="smooth-content" class="absolute -z-10 inset-0 w-full h-[600vh] bg-zinc-900 text-zinc-300 opacity-0 pointer-events-none">
	{@render children()}
</main>
