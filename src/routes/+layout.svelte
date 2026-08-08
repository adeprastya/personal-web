<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { SplitText } from 'gsap/SplitText';

	import { isProd, isDev } from '$lib/types/AppStage';
	import { projects } from '$lib/stores/projects.svelte';
	import { route } from '$lib/state/route.svelte';
	import { device } from '$lib/state/device.svelte';
	import { pointer } from '$lib/state/pointer.svelte';
	import { drag } from '$lib/state/dragControl.svelte';
	import { projectControl } from '$lib/state/projectControl.svelte';
	import { audios, audio } from '$lib/audio/sounds';

	import VercelAnalytics from './VercelAnalytics.svelte';
	import TypingTitle from './TypingTitle.svelte';
	import Head from './Head.svelte';
	import Intro from '$lib/components/ui/intro/Intro.svelte';
	import AppFrame from '$lib/components/ui/frame/AppFrame.svelte';
	import ScrollToNext from '$lib/components/ui/ScrollToNext.svelte';
	import WebGLScene from '$lib/components/scene/Canvas.svelte';

	let { children } = $props();

	// Global data & state initialization.
	onMount(function initGlobalState() {
		// Initialize data.
		projects.init();

		// Initialize stores.
		route.init();
		device.init();
		pointer.init();
		drag.init(() => pointer.dragDy);
		projectControl.reset();

		// Register plugins.
		gsap.registerPlugin(SplitText);

		return () => {
			device.destroy();
			pointer.destroy();
			drag.destroy();
		};
	});

	onMount(function startSounds() {
		if (isDev()) audios.introClicking();

		audios.pointerMove();
		$effect(function syncCursorSound() {
			const volume = Math.min(1, Math.hypot(pointer.hoverDx, pointer.hoverDy) * 0.03);
			const pitch = Math.hypot(pointer.hoverVx, pointer.hoverVy) * 0.00002 + 0.95;

			audio.get('Scanner')?.volume(volume);
			audio.get('Scanner')?.rate(pitch);
		})
	})

</script>

<Head />
<VercelAnalytics />

<div class="fixed z-10 size-full overflow-hidden">
	{#if browser}
		<WebGLScene />
	{/if}

	{@render children()}

	{#if isProd()}
		<Intro />
	{/if}

	<AppFrame />

	<ScrollToNext />
</div>

{#if browser}
	<TypingTitle />
{/if}
