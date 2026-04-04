<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let projects = data.projects;
</script>

<section class="flex min-h-screen w-full flex-col">
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
						<!-- <figure>
              <img 
                src={project.image_thumbnail_url} 
                alt="Screenshot of {project.title}" 
                itemprop="image"
                loading="lazy" 
              />
            </figure> -->

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
