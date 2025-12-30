<script lang="ts">
	import '../app.css';
	import AppFrame from '$lib/components/frame/AppFrame.svelte';
	import WebGLCanvas from '$lib/components/3d-threejs/Canvas.svelte';

	const title = 'Ade Prastya';
	const description =
		"Hi! I'm Ade Fathoni Prastya — a passionate web developer. Explore my portfolio, the stories behind my work, and connect with me.";
	const url = 'https://adefathoniprastya.vercel.app';
	const image = 'https://adefathoniprastya.vercel.app/og-image.jpg';
	const lang = 'en';

	let { children } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content={lang} />
	<link rel="canonical" href={url} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

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

<div class="w-full h-screen">
	<WebGLCanvas />
	<AppFrame />
</div>
<main class="bg-zinc-900 text-zinc-300">
	{@render children()}
</main>
