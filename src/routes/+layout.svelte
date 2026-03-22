<script lang="ts">
	import '../app.css';
	import { onMount } from "svelte";
	import { afterNavigate } from '$app/navigation';
	import { typingAnimation } from "$lib/utils/textAnimation";
	import { initScroll } from "$lib/scrollState.svelte"
	import ScrollToNext from "$lib/ScrollToNext.svelte";
	import AppFrame from '$lib/components/frame/AppFrame.svelte';
	import WebGLCanvas from '$lib/components/3d-scene/Canvas.svelte';

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

	afterNavigate(({ to, from }) => {
		typingAnimation(
			routesDetail[from?.url.pathname || "/"],
			routesDetail[to?.url.pathname || "/"],
			(s: string) => document.title = s || "|",
			{ delay: 100 }
		);
	});

	onMount(() => {
		initScroll()
	})
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESC} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content={LANG} />
	<link rel="canonical" href={URL} />

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

<div class="fixed z-10 w-full h-screen overflow-hidden">
	<WebGLCanvas />
	<AppFrame />
	<ScrollToNext routes={routes} />
</div>

<main id="smooth-content" class="h-[600vh] bg-zinc-900 text-zinc-300 absolute -z-10 inset-0 opacity-0 pointer-events-none">
	{@render children()}
</main>
