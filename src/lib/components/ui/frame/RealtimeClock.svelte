<script lang="ts">
	import { onMount } from 'svelte';

	let time = $state<string>('');

	// Time format based on Jakarta, Indonesia
	function updateTime() {
		time = new Date().toLocaleTimeString('id-ID', {
			timeZone: 'Asia/Jakarta',
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	onMount(function updateEverySecond() {
		updateTime();

		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});
</script>

<p class="font-mono text-xs text-zinc-800 sm:text-sm">
	<span>{time}</span>
	<span class="hidden sm:inline">[ID]</span>
</p>
