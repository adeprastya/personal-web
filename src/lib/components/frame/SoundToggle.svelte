<script lang="ts">
	let { animate = false } = $props();

	const bars = [
		{ w: 30, d: 0.3 },
		{ w: 60, d: 1 },
		{ w: 100, d: 0 },
		{ w: 60, d: 1 },
		{ w: 30, d: 0.3 }
	];
	const totalHeight = 150;
	const barHeight = 10;
	const spacing = (totalHeight - bars.length * barHeight) / (bars.length + 1);
</script>

<button
	aria-label="Sound Toggle"
	onclick={() => (animate = !animate)}
	class="group flex aspect-[2/3] w-4 cursor-pointer sm:w-5"
>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 {totalHeight}">
		{#each bars as { w, d }, i (i)}
			<rect
				x={0}
				y={(i + 1) * spacing + i * barHeight}
				width={100}
				height={barHeight}
				rx="3"
				fill="currentColor"
				style="
					transform: scaleX({w / 100});
					transform-origin: center;
					animation-delay: {d}s;
				"
				class="fill-zinc-700 transition-colors group-hover:fill-zinc-500 group-active:fill-zinc-900 {animate &&
					'animate'}"
			/>
		{/each}
	</svg>
</button>

<style>
	.animate {
		animation: XScaling 6s infinite linear both;
	}

	@keyframes XScaling {
		10% {
			transform: scaleX(0.4);
		}
		30% {
			transform: scaleX(0.8);
		}
		50% {
			transform: scaleX(0.2);
		}
		70% {
			transform: scaleX(1);
		}
		90% {
			transform: scaleX(0.4);
		}
	}
</style>
