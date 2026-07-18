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
		class="pointer-events-none fixed bottom-10 left-1/2 flex w-[80vw] -translate-x-1/2 items-center gap-2 select-none sm:bottom-6 sm:w-[40vw] md:w-[50vw]"
	>
		<!-- Bracket -->
		<span class="font-mono text-sm leading-none text-zinc-50/30">[</span>

		<!-- Track -->
		<div transition:fade={{ duration: 200 }} class="relative w-full">
			<div class="relative h-3 w-full overflow-hidden">
				<!-- Baseline -->
				<div class="absolute top-1/2 right-0 h-px w-full -translate-y-1/2 bg-zinc-50/30"></div>

				<!-- Progress bar -->
				<div
					class="absolute top-1/2 right-full h-px w-full -translate-y-1/2 bg-zinc-50 will-change-transform"
					style="transform: translateX({progressRatio * 100}%)"
				>
					<!-- Diamond tip -->
					<div
						class="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rotate-45 bg-zinc-50 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))]"
					></div>
				</div>
			</div>

			<div class="flex w-full justify-between">
				{#each Array(36) as _, i (i)}
					<!-- Tick marks -->
					<div
						class="h-1.5 w-px transition-colors duration-100 {i / 20 <= progressRatio
							? 'bg-zinc-50/60'
							: 'bg-zinc-50/15'}"
					></div>
				{/each}
			</div>
		</div>

		<!-- Bracket -->
		<span class="font-mono text-sm leading-none text-zinc-50/30">]</span>
	</div>
{/if}
