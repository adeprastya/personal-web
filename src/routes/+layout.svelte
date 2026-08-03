<script lang="ts">
	import '../app.css';
	import { PUBLIC_ENV } from '$env/static/public';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { SplitText } from 'gsap/SplitText';

	import { AppStage } from '$lib/types/AppStage';
	import { projects } from '$lib/stores/projects.svelte';
	import { route } from '$lib/state/route.svelte';
	import { device } from '$lib/state/device.svelte';
	import { pointer } from '$lib/state/pointer.svelte';
	import { drag } from '$lib/state/dragControl.svelte';
	import { projectControl } from '$lib/state/projectControl.svelte';

	import TypingTitle from './TypingTitle.svelte';
	import Head from './Head.svelte';
	import Intro from '$lib/components/ui/intro/Intro.svelte';
	import AppFrame from '$lib/components/ui/frame/AppFrame.svelte';
	import ScrollToNext from '$lib/components/ui/ScrollToNext.svelte';
	import WebGLScene from '$lib/components/scene/Canvas.svelte';

	let { children } = $props();

	// Global data & state initialization.
	onMount(() => {
		// Initialize data.
		projects.init();

		// Initialize stores.
		route.init();
		device.init();
		pointer.init();
		drag.init(() => pointer.dy);
		projectControl.reset();

		// Register plugins.
		gsap.registerPlugin(SplitText);

		return () => {
			device.destroy();
			pointer.destroy();
			drag.destroy();
		};
	});
</script>

<Head />

<div class="fixed z-10 size-full overflow-hidden">
	{#if browser}
		<WebGLScene />
	{/if}

	{@render children()}

	{#if PUBLIC_ENV == AppStage.PRODUCTION}
		<Intro />
	{/if}

	<AppFrame />

	<ScrollToNext />
</div>

{#if browser}
	<TypingTitle />
{/if}