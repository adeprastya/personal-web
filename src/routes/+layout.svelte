<script lang="ts">
	import '../app.css';
	import AppFrame from '$lib/components/layout/AppFrame.svelte';

	let { children } = $props();
</script>

<AppFrame />
<main>
	{@render children()}
</main>
