<script lang="ts">
	import type { PageData } from './$types';
	import { activeProjectData } from '$lib/contexts/activeProject.svelte';

	let { data }: { data: PageData } = $props();
	let projects = data.projects;

	let cachedData = $state(activeProjectData.data);
	let isVisible = $state(activeProjectData.index !== -1);

	$effect(() => {
		if (activeProjectData.index !== -1) {
			cachedData = $state.snapshot(activeProjectData.data);
			isVisible = true;
		} else {
			isVisible = false;
		}
	});
</script>

<section
	class="fixed top-0 left-0 flex h-screen w-full items-center justify-center bg-zinc-50/10 px-3 backdrop-blur-xs transition-opacity duration-800 text-shadow-md sm:px-10 md:px-20"
	style="opacity: {isVisible ? 1 : 0};"
>
	<div class="flex w-full max-w-3xl flex-col gap-3">
		<h1 class="font-mono text-xl leading-tight tracking-widest text-zinc-600 uppercase sm:text-4xl">
			{cachedData?.tagline}
		</h1>

		<div class="flex flex-wrap gap-2 font-mono text-xs tracking-widest text-zinc-700 uppercase">
			<span>{cachedData?.created_at}</span>
			<div class="flex flex-wrap gap-2">
				{#each cachedData?.technologies ?? [] as tech, i (i)}
					<span class="border-b border-zinc-800 px-2 py-0.5 text-zinc-700">{tech}</span>
				{/each}
			</div>
		</div>

		<p class="max-w-xl font-mono text-xs leading-relaxed text-zinc-700">
			{cachedData?.description}
		</p>

		<div class="flex gap-4 font-mono text-xs tracking-widest uppercase">
			{#if cachedData?.site_url}
				<a
					href={cachedData.site_url}
					target="_blank"
					class="flex cursor-pointer items-center gap-2 border border-zinc-800 px-2 py-1 text-zinc-600
                  transition-colors duration-200 hover:border-zinc-600 hover:text-zinc-500"
				>
					LIVE SITE //
				</a>
			{/if}
			{#if cachedData?.source_code_url}
				<a
					href={cachedData.source_code_url}
					target="_blank"
					class="flex cursor-pointer items-center gap-2 border border-zinc-800 px-2 py-1 text-zinc-700
                  transition-colors duration-200 hover:border-zinc-700 hover:text-zinc-600"
				>
					SOURCE CODE //
				</a>
			{/if}
		</div>
	</div>
</section>

<!-- Hidden projects data for screen readers & search engines -->
<section class="pointer-events-auto absolute -z-50 opacity-0">
	<h1>Works</h1>
	<p>
		Dedicated to writing clean, efficient, and scalable code by harnessing cutting-edge tools and
		best practices. Drive to solve real problems that make life easier and better.
	</p>

	{#if projects.length === 0}
		<div role="alert">Im, sorry. Something went wrong.</div>
	{:else}
		<ul>
			{#each projects as project (project.id)}
				<li>
					<article itemscope itemtype="https://schema.org/CreativeWork">
						<h2 itemprop="name">{project.title}</h2>
						<p><strong aria-hidden="true">Tagline:</strong> {project.tagline}</p>

						<div role="group" aria-label="Technologies used">
							{#each project.technologies as tech, i (i)}
								<span class="badge">{tech}</span>
							{/each}
						</div>

						<nav class="links" aria-label="Project links for {project.title}">
							<a
								href={project.site_url}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Visit live demo of {project.title}"
							>
								Demo
							</a>
							<a
								href={project.source_code_url}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="View source code of {project.title} on GitHub"
							>
								Source Code
							</a>
						</nav>
					</article>
				</li>
			{/each}
		</ul>
	{/if}
</section>
