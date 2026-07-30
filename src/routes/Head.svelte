<script lang="ts">
	const site = {
		name: 'Ade Prastya',
		career: 'Software Developer',
		url: 'https://adeprastya.vercel.app',
		image: 'https://adeprastya.vercel.app/og-image.jpg',
		lang: 'en',
		sameAs: [
			'https://www.instagram.com/s.c.a.l.a.r',
			'https://www.linkedin.com/in/adeprastya',
			'https://github.com/adeprastya'
		]
	};
	const description = `Hi! I'm ${site.name} - a passionate ${site.career}. Explore my portfolio, the stories behind my work, and connect with me.`;
</script>

<svelte:head>
	<title>{site.name}</title>

	<meta name="description" content={description} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content={site.lang} />
	<link rel="canonical" href={site.url} />

	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={site.name} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={site.url} />
	<meta property="og:image" content={site.image} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={site.name} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={site.image} />

	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Ade Prastya",
			"jobTitle": "Software Developer",
			"url": "https://adeprastya.vercel.app",
			"sameAs": [
				"https://www.instagram.com/s.c.a.l.a.r",
				"https://www.linkedin.com/in/adeprastya",
				"https://github.com/adeprastya"
			]
		}
	</script>
</svelte:head>
