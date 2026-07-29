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
	import { activeProject } from '$lib/state/activeProject.svelte';

	const { scene, camera, renderer, size, renderStage } = useThrelte();
	const composer = new EffectComposer(renderer);

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
	const noiseEffect = untrack(
		() =>
			new NoiseEffect({
				blendFunction: BlendFunction.AVERAGE,
				premultiply: true
			})
	);
	const chromaticEffect = untrack(
		() =>
			new ChromaticAberrationEffect({
				strength: 0.006,
				blendFunction: BlendFunction.SCREEN
			})
	);
	const dimensionalEffect = untrack(
		() =>
			new InvertedDimensionalEffect({
				progress: 0,
				time: 0,
				autoTime: true
			})
	);

	$effect(() => {
		if (activeProject.isVisible) {
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

	composer.addPass(new RenderPass(scene, camera.current));
	composer.addPass(
		new EffectPass(camera.current, dimensionalEffect, bloomEffect, chromaticEffect, noiseEffect)
	);

	// Sync composer with camera
	$effect(() => {
		const cam = camera.current;
		if (!cam) return;

		composer.removeAllPasses();

		composer.addPass(new RenderPass(scene, cam));
		composer.addPass(
			new EffectPass(cam, dimensionalEffect, bloomEffect, chromaticEffect, noiseEffect)
		);
	});

	// Sync composer size
	$effect(() => {
		composer.setSize(size.current.width, size.current.height);
	});

	// Render composer
	useTask(
		(delta) => {
			composer.render(delta);
		},
		{
			stage: renderStage,
			autoInvalidate: false
		}
	);

	onDestroy(() => {
		composer.dispose();
	});
</script>
