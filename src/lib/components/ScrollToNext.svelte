<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { dragProgress, resetProgress } from '$lib/contexts/dragProgress.svelte';

	let { routes } = $props<{ routes: string[] }>();

	let isNavigating = $state(false);
	let lockedPathname = $state('');

	const curIdx = $derived(routes.findIndex((l: string) => l === page.url.pathname));
	const nextIdx = $derived((curIdx + 1) % routes.length);
	const progressRatio = $derived(dragProgress.value);
	const show = $derived(progressRatio > 0.01);

	const routeLabel = $derived(`${routes[curIdx]} → ${routes[nextIdx]}`);

	$effect(() => {
		const pathname = page.url.pathname;
		if (pathname !== lockedPathname) {
			isNavigating = false;
			lockedPathname = pathname;
			resetProgress();
		}

		if (isNavigating) return;
		if (progressRatio < 0.98) return;

		const nextPath = routes[nextIdx];
		isNavigating = true;
		goto(nextPath);
	});
</script>

{#if show}
	<div
		transition:fade={{ duration: 200 }}
		class="fixed bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
	>
		<!-- bar -->
		<div class="flex items-center gap-2">
			<span class="font-mono text-sm leading-none text-white/25">[</span>

			<div class="relative h-px w-[28vw] max-w-[240px] bg-white/10">
				<!-- fill -->
				<div class="absolute inset-y-0 left-0 bg-white" style="width: {progressRatio * 100}%"></div>
				<!-- diamond tip -->
				<div
					class="absolute top-1/2 size-[5px] translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
					style="right: {100 - progressRatio * 100}%"
				></div>
			</div>

			<span class="font-mono text-sm leading-none text-white/25">]</span>
		</div>

		<!-- tick marks -->
		<div class="flex w-[28vw] max-w-[240px] justify-between">
			{#each Array(21) as _, i (i)}
				<div
					class="h-1 w-px transition-colors duration-100 {i / 20 <= progressRatio
						? 'bg-white/50'
						: 'bg-white/15'}"
				></div>
			{/each}
		</div>
	</div>
{/if}
