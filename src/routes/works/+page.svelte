<script lang="ts">
	import { tick } from 'svelte';
	import gsap from 'gsap';
	import { SplitText } from 'gsap/SplitText';

	import type { PageData } from './$types';
	import { AppRoute } from '$lib/types/AppRoute';
	import { route } from '$lib/state/route.svelte';
	import { activeProject } from '$lib/state/activeProject.svelte';

	import WorksSEO from './WorksSEO.svelte';
	import ProjectNav from './ProjectNav.svelte';

	let { data }: { data: PageData } = $props();

	let projects = $derived(data.projects);
	let cachedData = $state(activeProject.data);
	let isVisible = $derived(activeProject.isVisible);

	type Refs = { [key: string]: HTMLElement | null };
	const refs: Refs = {
		section: null,
		tagline: null,
		meta: null,
		desc: null,
		links: null
	};

	const animation = {
		tl: null as gsap.core.Timeline | null,
		taglineSplit: null as SplitText | null,
		descSplit: null as SplitText | null
	};

	function animateIn() {
		if (!refs.section || !refs.tagline || !refs.meta || !refs.desc || !refs.links) return;

		animation.tl?.kill();

		animation.taglineSplit?.revert();
		animation.descSplit?.revert();

		refs.tagline.textContent = cachedData?.tagline ?? '';
		refs.desc.textContent = cachedData?.description ?? '';

		animation.taglineSplit = new SplitText(refs.tagline, { type: 'words' });
		animation.descSplit = new SplitText(refs.desc, { type: 'words' });

		animation.tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

		animation.tl.fromTo(refs.section, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
		animation.tl.fromTo(
			animation.taglineSplit.words,
			{ x: -40, skewX: -25, opacity: 0 },
			{ x: 0, skewX: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
			0.1
		);
		animation.tl.fromTo(
			refs.meta,
			{ x: -40, skewX: -25, opacity: 0 },
			{ x: 0, skewX: 0, opacity: 1, duration: 0.8 },
			0.8
		);
		animation.tl.fromTo(
			animation.descSplit.words,
			{ x: -40, skewX: -25, opacity: 0 },
			{ x: 0, skewX: 0, opacity: 1, duration: 0.4, stagger: 0.005 },
			0.8
		);
		animation.tl.fromTo(
			refs.links.children,
			{ x: -40, skewX: -25, opacity: 0 },
			{ x: 0, skewX: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
			1.2
		);
	}

	function animateOut() {
		if (!refs.section) return;

		animation.tl?.kill();
		animation.tl = gsap.timeline({
			onComplete: () => {
				animation.taglineSplit?.revert();
				animation.descSplit?.revert();
			}
		});
		animation.tl.to(refs.section, { opacity: 0, duration: 0.25, ease: 'power2.in' });
	}

	$effect(function updateCache() {
		if (activeProject.index !== -1) {
			cachedData = $state.snapshot(activeProject.data);
		}
	});

	$effect(function animateVisibility() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = cachedData;
		const visible = isVisible;

		tick().then(() => {
			if (visible) animateIn();
			else animateOut();
		});
	});
</script>

{#if route.is(AppRoute.Works)}
	<ProjectNav {projects} />
{/if}

<section
	bind:this={refs.section}
	class="fixed top-0 left-0 flex h-screen w-full items-center justify-center px-9 backdrop-blur-xs text-shadow-md sm:px-14 md:px-20"
	style={`pointer-events: ${isVisible ? 'auto' : 'none'};`}
>
	<button
		onclick={() => activeProject.hide()}
		class="flex w-full max-w-3xl flex-col items-start gap-3 text-left"
	>
		<!-- Tagline -->
		<h2
			bind:this={refs.tagline}
			class="font-mono text-xl leading-tight tracking-widest text-zinc-600 uppercase sm:text-4xl"
		>
			{cachedData?.tagline}
		</h2>

		<!-- Date & Technologies -->
		<div
			bind:this={refs.meta}
			class="flex flex-wrap gap-2 font-mono text-xs tracking-widest text-zinc-700 uppercase"
		>
			<span>{cachedData?.created_at}</span>
			<div class="flex flex-wrap gap-2">
				{#each cachedData?.technologies ?? [] as tech, i (i)}
					<span class="border-b border-zinc-800 px-2 py-0.5 text-zinc-700">{tech}</span>
				{/each}
			</div>
		</div>

		<!-- Description -->
		<p
			bind:this={refs.desc}
			class="max-w-xl text-justify font-mono text-xs leading-relaxed text-zinc-700"
		>
			{cachedData?.description}
		</p>

		<!-- Links -->
		<div bind:this={refs.links} class="flex gap-4 font-mono text-xs tracking-widest uppercase">
			{#if cachedData?.site_url}
				<a
					href={cachedData.site_url}
					target="_blank"
					class="flex cursor-pointer items-center gap-2 border border-zinc-400 px-2 py-1 text-zinc-600 transition-colors duration-300 hover:border-zinc-900 hover:text-zinc-800"
				>
					LIVE SITE //
				</a>
			{/if}
			{#if cachedData?.source_code_url}
				<a
					href={cachedData.source_code_url}
					target="_blank"
					class="flex cursor-pointer items-center gap-2 border border-zinc-400 px-2 py-1 text-zinc-600 transition-colors duration-300 hover:border-zinc-900 hover:text-zinc-800"
				>
					SOURCE CODE //
				</a>
			{/if}
		</div>
	</button>
</section>

<WorksSEO {projects} />
