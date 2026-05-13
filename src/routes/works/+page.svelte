<script lang="ts">
  import type { PageData } from './$types';
  import { activeProjectData } from "$lib/contexts/activeProject.svelte";

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
  class="fixed top-0 left-0 backdrop-blur-xs w-full h-screen px-3 sm:px-10 md:px-20 bg-zinc-50/10 text-shadow-md flex items-center justify-center transition-opacity duration-800"
  style="opacity: {isVisible ? 1 : 0};"
>
  <div class="w-full max-w-3xl flex flex-col gap-3">
    <h1 class="text-zinc-600 font-mono text-xl sm:text-4xl uppercase tracking-widest leading-tight">
      {cachedData?.tagline}
    </h1>

    <div class="flex flex-wrap gap-2 font-mono text-xs text-zinc-700 uppercase tracking-widest">
      <span>{cachedData?.created_at}</span>
      <div class="flex flex-wrap gap-2">
        {#each cachedData?.technologies ?? [] as tech, i (i)}
          <span class="border-b border-zinc-800 text-zinc-700 px-2 py-0.5">{tech}</span>
        {/each}
      </div>
    </div>

    <p class="font-mono text-xs text-zinc-700 leading-relaxed max-w-xl">
      {cachedData?.description}
    </p>

    <div class="flex gap-4 font-mono text-xs uppercase tracking-widest">
      {#if cachedData?.site_url}
        <a href={cachedData.site_url} target="_blank"
          class="cursor-pointer flex items-center gap-2 text-zinc-600 border border-zinc-800 px-2 py-1
                  hover:border-zinc-600 hover:text-zinc-500 transition-colors duration-200">
          LIVE SITE //
        </a>
      {/if}
      {#if cachedData?.source_code_url}
        <a href={cachedData.source_code_url} target="_blank"
          class="cursor-pointer flex items-center gap-2 text-zinc-700 border border-zinc-800 px-2 py-1
                  hover:border-zinc-700 hover:text-zinc-600 transition-colors duration-200">
          SOURCE CODE //
        </a>
      {/if}
    </div>
  </div>
</section>

<!-- Hidden projects data for screen readers & search engines -->
<section class="pointer-events-auto opacity-0 absolute -z-50">
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
