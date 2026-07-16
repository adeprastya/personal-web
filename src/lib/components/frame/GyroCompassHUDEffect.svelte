<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { pointerData } from '$lib/contexts/pointer.svelte';

	const CFG = {
		tickCount: 40, // Total number of tick slots across the ruler (minor + major combined)
		majorEvery: 8, // Draw a major tick (longer line + number label) every Nth tick
		tickStep: 2, // Value increment per tick; major tick label = tick index * tickStep
		markerShiftRatio: 0.5, // How far the diamond marker travels, as a ratio of track width (0-1)
		tickShiftTravel: 40 // How far the ticks + labels travel (in px), moving opposite the marker
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

		$effect(() => {
			if (!trackWidth) return;

			// normalization [-1, 1]
			const norm = gsap.utils.mapRange(0, window.innerWidth, -1, 1)(pointerData.x ?? window.innerWidth / 2);

			const markerRange = trackWidth * CFG.markerShiftRatio;

			xMarker(norm * markerRange);
			xTicks(-norm * CFG.tickShiftTravel);
		});
	});
</script>

<div class="relative flex w-[80vw] sm:w-[60vw] items-center gap-2 font-mono select-none">
	<!-- Bracket -->
	<span class="absolute -top-1.5 -left-3 text-[14px] leading-none text-neutral-50/40">[</span>
	<span class="absolute -top-1.5 -right-3 text-[14px] leading-none text-neutral-50/40">]</span>

	<!-- Main ruler track -->
	<div bind:this={trackEl} class="relative h-7 flex-1 overflow-hidden">
		<!-- Baseline -->
		<div class="absolute top-0 right-0 left-0 h-px bg-neutral-50/30"></div>

		<!-- Tick marks with numbers -->
		<div
			bind:this={ticksEl}
			class="absolute inset-x-0 top-0 flex justify-between will-change-transform"
		>
			{#each ticks as t (t.i)}
				<div class="flex flex-col items-center">
					<span class={t.major ? 'h-1.5 w-px bg-neutral-50/40' : 'h-1 w-px translate-y-1 bg-neutral-50/20'}
					></span>
					{#if t.major}
						<span class="mt-[3px] text-[6px] tracking-[0.04em] text-neutral-50/60">
							{t.label}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	
	<!-- Diamond marker -->
		<div bind:this={markerEl} class="absolute top-0 left-1/2 -mt-[2px] -ml-[2px] will-change-transform">
			<div
				class="size-[4px] rotate-45 bg-neutral-50 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))]"
			></div>
	</div>
</div>
