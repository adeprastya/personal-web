<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { pointerData } from '$lib/contexts/pointer.svelte';

	const CFG = {
		tickCount: 40, // Total of tick slots across the ruler (minor + major combined)
		majorEvery: 8, // Draw a major tick, every Nth tick
		tickStep: 4, // Value increment per tick; major tick label = tick index * tickStep
		markerShiftRatio: 0.5, // Diamond marker travels, in ratio (0-1)
		tickShiftTravel: 40 // Ticks + labels travel (in px), opposite the marker
	};

	let trackEl: HTMLDivElement;
	let ticksEl: HTMLDivElement;
	let markerEl: HTMLDivElement;
	let trackWidth = $state(0);

	const ticks = Array.from({ length: CFG.tickCount + 1 }, (_, i) => ({
		i,
		major: i % CFG.majorEvery === 0,
		label: (i * CFG.tickStep).toString().padStart(2, '0')
	}));

	onMount(() => {
		trackWidth = trackEl.offsetWidth;

		gsap.set(markerEl, { x: 0 });
		gsap.set(ticksEl, { x: 0 });

		const xMarker = gsap.quickTo(markerEl, 'x', { duration: 0.4, ease: 'power4.out' });
		const xTicks = gsap.quickTo(ticksEl, 'x', { duration: 0.4, ease: 'power4.out' });
		xMarker(window.innerWidth / 2);
		xTicks(window.innerWidth / 2);

		$effect(() => {
			if (!trackWidth) return;

			// normalization [-1, 1]
			const norm = gsap.utils.mapRange(0, window.innerWidth, -1, 1)(pointerData.x);

			xMarker(norm * trackWidth * CFG.markerShiftRatio);
			xTicks(-norm * CFG.tickShiftTravel);
		});
	});
</script>

<div
	class="pointer-events-none relative flex w-[80vw] items-center gap-2 font-mono sm:w-[40vw] md:w-[50vw]"
>
	<!-- Bracket -->
	<span class="translate-y-1.5 font-mono text-sm leading-none text-zinc-50/30">[</span>

	<!-- Track -->
	<div bind:this={trackEl} class="relative h-4 flex-1 overflow-hidden">
		<div
			bind:this={ticksEl}
			class="absolute inset-x-0 bottom-0 flex justify-between will-change-transform"
		>
			{#each ticks as t (t.i)}
				<div class="flex flex-col items-center">
					<!-- Tick labels -->
					{#if t.major}
						<span class="mt-1.5 text-[6px] tracking-tight text-zinc-50">
							{t.label}
						</span>
					{/if}
					<!-- Tick marks -->
					<span
						class={t.major ? 'h-1 w-px bg-zinc-50/30' : 'h-1.5 w-px translate-y-2.5 bg-zinc-50/15'}
					></span>
				</div>
			{/each}
		</div>

		<!-- Baseline -->
		<div class="absolute right-0 bottom-0 left-0 h-px bg-zinc-50/30"></div>
	</div>

	<!-- Diamond tip -->
	<div
		bind:this={markerEl}
		class="absolute bottom-0 left-1/2 -ml-[2px] size-1.5 translate-y-1/2 rotate-45 bg-zinc-50 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))] will-change-transform"
	></div>

	<!-- Bracket -->
	<span class="translate-y-1.5 font-mono text-sm leading-none text-zinc-50/30">]</span>
</div>
