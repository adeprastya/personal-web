<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { useTask, useThrelte } from '@threlte/core';
	import gsap from 'gsap';
	import {
		BloomEffect,
		EffectComposer,
		EffectPass,
		RenderPass,
		NoiseEffect,
		BlendFunction
	} from 'postprocessing';
	import { ChromaticAberrationEffect } from './chromaticAberration';
	import { InvertedDimensionalEffect } from './invertedDimensional';
	import { projectControl } from '$lib/state/projectControl.svelte';

	const { scene, camera, renderer, size, renderStage } = useThrelte();

	const composer = new EffectComposer(renderer);

	/** Adds bloom to bright areas. */
	const bloomEffect = untrack(
		() =>
			new BloomEffect({
				blendFunction: BlendFunction.SCREEN,
				luminanceThreshold: 0.1,
				luminanceSmoothing: 0.2,
				intensity: 1.4,
				radius: 0.15,
				levels: 8,
				mipmapBlur: true
			})
	);

	/** Adds subtle film grain. */
	const noiseEffect = untrack(
		() =>
			new NoiseEffect({
				blendFunction: BlendFunction.AVERAGE,
				premultiply: true
			})
	);

	/** Simulates RGB channel separation. */
	const chromaticEffect = untrack(
		() =>
			new ChromaticAberrationEffect({
				strength: 0.006,
				blendFunction: BlendFunction.SCREEN
			})
	);

	/** Drives the dimensional transition effect. */
	const dimensionalEffect = untrack(
		() =>
			new InvertedDimensionalEffect({
				progress: 0,
				time: 0,
				autoTime: true
			})
	);

	/** Animate the transition when the project view is shown or hidden. */
	$effect(function animateDimensional() {
		if (projectControl.isVisible) {
			gsap.fromTo(
				dimensionalEffect,
				{ progress: 0 },
				{
					progress: 1,
					duration: 1,
					ease: 'power2.inOut'
				}
			);
		} else {
			gsap.fromTo(
				dimensionalEffect,
				{ progress: 1 },
				{
					progress: 0,
					duration: 1,
					ease: 'power2.inOut'
				}
			);
		}
	});

	/** Initialize the post-processing pipeline. */
	composer.addPass(new RenderPass(scene, camera.current));
	composer.addPass(
		new EffectPass(camera.current, dimensionalEffect, bloomEffect, chromaticEffect, noiseEffect)
	);

	$effect(function syncPasses() {
		const cam = camera.current;
		if (!cam) return;

		composer.removeAllPasses();

		composer.addPass(new RenderPass(scene, cam));
		composer.addPass(
			new EffectPass(cam, dimensionalEffect, bloomEffect, chromaticEffect, noiseEffect)
		);
	});

	$effect(function syncResolution() {
		composer.setSize(size.current.width, size.current.height);
	});

	useTask(
		function runComposer(delta) {
			composer.render(delta);
		},
		{
			stage: renderStage,
			autoInvalidate: false
		}
	);

	onDestroy(function cleanupComposer() {
		composer.dispose();
	});
</script>
