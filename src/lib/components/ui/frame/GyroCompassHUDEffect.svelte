<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { pointer } from '$lib/state/pointer.svelte';

	const config = {
		tickCount: 40, // Total of tick slots across the ruler (minor + major combined)
		majorEvery: 8, // Draw a major tick, every Nth tick
		tickStep: 4, // Value increment per tick; major tick label = tick index * tickStep
		markerShiftRatio: 0.5, // Diamond marker travels, in ratio (0-1)
		tickShiftTravel: 40 // Ticks + labels travel (in px), opposite the marker
	};

	type Refs = {
		track: HTMLDivElement | null;
		ticks: HTMLDivElement | null;
		marker: HTMLDivElement | null;
	};
	const refs: Refs = {
		track: null,
		ticks: null,
		marker: null
	};

	// Create ticks with the label
	const ticks = Array.from({ length: config.tickCount + 1 }, (_, i) => ({
		i,
		major: i % config.majorEvery === 0,
		label: (i * config.tickStep).toString().padStart(2, '0')
	}));

	onMount(function animateMarkerAndTicks() {
		gsap.set(refs.marker, { x: 0 });
		gsap.set(refs.ticks, { x: 0 });

		const xMarker = gsap.quickTo(refs.marker, 'x', { duration: 0.4, ease: 'power4.out' });
		const xTicks = gsap.quickTo(refs.ticks, 'x', { duration: 0.4, ease: 'power4.out' });

		xMarker(window.innerWidth / 2);
		xTicks(window.innerWidth / 2);

		$effect(() => {
			const trackWidth = refs.track?.offsetWidth ?? 0;

			// Normalize to [-1, 1]
			const norm = gsap.utils.mapRange(0, window.innerWidth, -1, 1)(pointer.x);

			xMarker(norm * config.markerShiftRatio * trackWidth);
			xTicks(-norm * config.tickShiftTravel);
		});
	});
</script>

<div
	class="pointer-events-none relative flex w-[80vw] items-center gap-2 font-mono sm:w-[40vw] md:w-[50vw]"
>
	<!-- Bracket -->
	<span class="translate-y-1.5 font-mono text-sm leading-none text-zinc-50/30">[</span>

	<!-- Track -->
	<div bind:this={refs.track} class="relative h-4 flex-1 overflow-hidden">
		<div
			bind:this={refs.ticks}
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

	<!-- Diamond tip marker -->
	<div
		bind:this={refs.marker}
		class="absolute bottom-0 left-1/2 -ml-[2px] size-1.5 translate-y-1/2 rotate-45 bg-zinc-50 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))] will-change-transform"
	></div>

	<!-- Bracket -->
	<span class="translate-y-1.5 font-mono text-sm leading-none text-zinc-50/30">]</span>
</div>
