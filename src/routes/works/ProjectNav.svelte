<script lang="ts">
	import { dragProgress } from '$lib/contexts/dragProgress.svelte';
	import { MathUtils } from 'three';
	import { trapezoid } from '$lib/utils/progressManipulation';

	let { projects } = $props();

	const total = (() => projects.length)();
	const rawProgress = $derived(dragProgress.works * total);
	let progresses: number[] = $derived.by(() => {
		return Array.from({ length: total }).map((_, i) => {
			const chunk = MathUtils.clamp(MathUtils.mapLinear(rawProgress, i, i + 1, 0, 1), 0, 1);
			return trapezoid(chunk, 0.4, 0.6, 0, 1);
		});
	});
	let itemActiveProgress = $derived(progresses.reduce((a, b) => a + b, 0));
</script>

<nav class="fixed bottom-18 sm:bottom-1/2 left-10 sm:left-20 sm:translate-y-1/2 select-none">
	<!-- Vertical line -->
	<div class="absolute top-0 left-0 h-full w-px bg-zinc-500/30"></div>

	<!-- Diamond marker -->
	<div
		class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-zinc-50/60 will-change-[top]"
		style:top="{dragProgress.works * 100}%"
	>
		<div
			class="absolute inset-[2px] bg-red-500 will-change-[opacity]"
			style:opacity={itemActiveProgress}
		></div>
	</div>

	<div class="flex flex-col gap-0">
		{#each projects as p, i (projects[i].id)}
			<button
				onclick={() => {
					dragProgress.setValue((i + 0.5) / total, 1);
				}}
				class="relative flex cursor-pointer items-center gap-4 overflow-hidden py-3 px-8"
			>
				<!-- Hover line -->
				<div
					style:width="{progresses[i] * 20}px"
					class="absolute top-1/2 left-0 h-px bg-zinc-100 will-change-[width]"
				></div>

				<!-- Overlay bg -->
				<div
					class="absolute inset-0 -z-10 bg-zinc-900 will-change-[opacity] {progresses[i] === 0 ? 'opacity-40' : 'opacity-80'} transition-all ease-linear duration-500"
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
					class="font-mono text-xs tracking-widest uppercase {progresses[i] === 0 ? 'opacity-70' : 'opacity-100'} transition-all duration-300"
				>
					{p.title}
				</span>
			</button>
		{/each}
	</div>
</nav>
