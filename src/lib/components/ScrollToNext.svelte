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
		<!-- Track bar -->
		<div class="flex items-center gap-2">
			<span class="font-mono text-sm leading-none text-neutral-50/25">[</span>

			<div class="relative h-px w-[28vw] max-w-[240px] bg-neutral-50/10">
				<!-- Fill -->
				<div class="absolute inset-y-0 left-0 bg-neutral-50" style="width: {progressRatio * 100}%"></div>
				<!-- Diamond tip -->
				<div
					class="absolute top-1/2 size-[5px] translate-x-1/2 -translate-y-1/2 rotate-45 bg-neutral-50 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))]"
					style="right: {100 - progressRatio * 100}%"
				></div>
			</div>

			<span class="font-mono text-sm leading-none text-neutral-50/25">]</span>
		</div>

		<!-- Tick marks -->
		<div class="flex w-[28vw] max-w-[240px] justify-between">
			{#each Array(21) as _, i (i)}
				<div
					class="h-1 w-px transition-colors duration-100 {i / 20 <= progressRatio
						? 'bg-neutral-50/50'
						: 'bg-neutral-50/15'}"
				></div>
			{/each}
		</div>
	</div>
{/if}
