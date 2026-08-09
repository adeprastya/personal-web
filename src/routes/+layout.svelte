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
	import { intro } from '$lib/state/intro.svelte';

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

		intro.tick(40);

		// Initialize state.
		route.init();
		device.init();

		intro.tick(60);

		pointer.init();
		drag.init(() => pointer.dragDy);
		projectControl.reset();

		intro.tick(80);

		audio.init();

		// Register plugins.
		gsap.registerPlugin(SplitText);

		intro.tick(100);

		return function cleanup() {
			device.destroy();
			pointer.destroy();
			drag.destroy();
		};
	});

	onMount(function startSounds() {
		if (isDev()) {
			audios.introClicking();
		}

		audios.pointerMove();
		$effect(function syncCursorSound() {
			const volume = Math.min(0.2, Math.hypot(pointer.hoverDx, pointer.hoverDy) * 0.0004 + 0.09);
			const pitch = Math.hypot(pointer.hoverVx, pointer.hoverVy) * 0.00005 + 1;
			audio.get('Wind')?.volume(volume);
			audio.get('Wind')?.rate(pitch);
		});

		$effect(function syncDragSound() {
			const volume = Math.min(0.2, Math.abs(pointer.dragDy) * 0.0003 + 0.09);
			const pitch = Math.abs(pointer.dragVy) * 0.00005 + 1;
			audio.get('Wind')?.volume(volume);
			audio.get('Wind')?.rate(pitch);
		});
	});
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
