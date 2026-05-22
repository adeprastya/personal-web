<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */

	interface Props {
		progress: number; // 0–100
		size?: number;
		ticks?: number;
	}

	let { progress = 0, size = 80, ticks = 32 }: Props = $props();

	const radius = () => size / 2;
	const tickLen = () => size * 0.08;
	const tickDist = () => radius() - tickLen() - 2;

	function tickCoords(i: number, total: number) {
		const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
		const x1 = radius() + Math.cos(angle) * tickDist();
		const y1 = radius() + Math.sin(angle) * tickDist();
		const x2 = radius() + Math.cos(angle) * (tickDist() + tickLen());
		const y2 = radius() + Math.sin(angle) * (tickDist() + tickLen());
		return { x1, y1, x2, y2 };
	}
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}">
	{#each Array.from({ length: ticks }) as _, i (i)}
		{@const { x1, y1, x2, y2 } = tickCoords(i, ticks)}
		<line
			{x1}
			{y1}
			{x2}
			{y2}
			stroke={i / ticks < progress / 100 ? '#18181b' : '#d4d4d8'}
			stroke-width="2"
			stroke-linecap="round"
		/>
	{/each}
	<text
		x={radius()}
		y={radius() + 5}
		text-anchor="middle"
		font-size={size * 0.18}
		fill="#18181b"
		font-family="inherit">{progress}%</text
	>
</svg>
