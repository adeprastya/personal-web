<script lang="ts">
	import { onMount } from 'svelte';

	let windowWidth: number;
	let time: string;

	function updateTime() {
		time = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	onMount(() => {
		updateTime();

		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />

<p class="font-mono text-xs text-zinc-800 sm:text-sm">
	{time}
	{#if windowWidth > 640}
		[ID]
	{/if}
</p>
