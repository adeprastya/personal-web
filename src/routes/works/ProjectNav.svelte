<script lang="ts">
	import { AppRoute } from '$lib/types/AppRoute';
	import { drag } from '$lib/state/dragControl.svelte';
	import { MathUtils } from 'three';
	import { trapezoid } from '$lib/utils/progressManipulation';
	import { audios } from '$lib/audio/sounds';
	import { projectControl } from '$lib/state/projectControl.svelte';

	let { projects } = $props();

	const total = (() => projects.length)();
	const rawProgress = $derived(drag.is(AppRoute.Works) * total);

	let progresses: number[] = $derived.by(() => {
		return Array.from({ length: total }).map((_, i) => {
			const chunk = MathUtils.clamp(MathUtils.mapLinear(rawProgress, i, i + 1, 0, 1), 0, 1);
			return trapezoid(chunk, 0.4, 0.6, 0, 1);
		});
	});
	let itemActiveProgress = $derived(progresses.reduce((a, b) => a + b, 0));

	let itemActive = $derived(Math.floor(rawProgress));
	$effect(function itemSwitchSound() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = itemActive;
		audios.projectItemSwitching();
	});
</script>

<nav class:opacity-0={projectControl.isVisible} class="fixed bottom-18 left-10 select-none sm:bottom-1/2 sm:left-20 sm:translate-y-1/2 transition-[opacity] duration-600 ease-in-out">
	<!-- Vertical line -->
	<div class="absolute top-0 left-0 h-full w-px bg-zinc-500/30"></div>

	<!-- Diamond marker -->
	<div
		class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-zinc-50/60 will-change-[top]"
		style:top="{drag.is(AppRoute.Works) * 100}%"
	>
		<div
			class="absolute inset-[2px] bg-red-500 will-change-[opacity]"
			style:opacity={itemActiveProgress}
		></div>
	</div>

	<div class="flex flex-col gap-0">
		{#each projects as p, i (projects[i].id)}
			<button
				onclick={() => drag.set((i + 0.5) / total, 1)}
				class="relative flex cursor-pointer items-center gap-4 overflow-hidden px-8 py-3"
			>
				<!-- Hover line -->
				<div
					style:width="{progresses[i] * 20}px"
					class="absolute top-1/2 left-0 h-px bg-zinc-100 will-change-[width]"
				></div>

				<!-- Overlay bg -->
				<div
					class="absolute inset-0 -z-10 bg-zinc-900 will-change-[opacity] {progresses[i] === 0
						? 'opacity-40'
						: 'opacity-80'} transition-all duration-500 ease-linear"
				></div>

				<!-- Number -->
				<span
					style:color="rgba(255,255,255,{0.4 + progresses[i] * 0.6})"
					class="w-8 font-mono text-xs tracking-wide text-zinc-500 transition-colors duration-300"
				>
					{i.toString().padStart(2, '0')}
				</span>

				<!-- Title -->
				<span
					style="transform:translateX({progresses[i] * 6}px);"
					class="font-mono text-xs tracking-widest uppercase {progresses[i] === 0
						? 'opacity-70'
						: 'opacity-100'} transition-all duration-300"
				>
					{p.title}
				</span>
			</button>
		{/each}
	</div>
</nav>
