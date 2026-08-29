<script lang="ts">
	import { drag } from '$lib/state/dragControl.svelte';

	const accumulateKey = ['Space', 'ArrowDown', 'ArrowRight'];
	function handleAccumulate(e: KeyboardEvent) {
		if (!accumulateKey.includes(e.code)) return;
		e.preventDefault(); // Prevent after check to keep default behavior

		drag.accumulate(26);
	}
</script>

<svelte:window onkeydown={handleAccumulate} />
