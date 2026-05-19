<script lang="ts">
	import { HalfFloatType } from 'three';
	import gsap from 'gsap';
	import { untrack } from 'svelte';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';

	import { AppRoute } from '$lib/types/Route';
	import { projectStore } from '$lib/stores/projects.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { scrollData } from '$lib/contexts/scroll.svelte';
	import { pointerData } from '$lib/contexts/pointer.svelte';
	import { setActiveProject } from '$lib/contexts/activeProject.svelte';

	import { DimensionalEffect } from '$lib/effects/DimensionalEffect';
	import ProjectPlane from './shared/ProjectPlane.svelte';
	import ProjectText from './shared/ProjectText.svelte';

	let isOnWorks = $derived(routeData.current === AppRoute.works);
	let totalProjects = $derived(projectStore.projects.length);
	let currentIndex = $state(0);
	let isTransitioning = $state(false);
	let progress = $state(0);
	let currentProject = $derived(projectStore.projects[currentIndex] ?? null);

	const { renderer, scene, camera, renderStage, autoRender } = useThrelte();
	const invertEffect = new DimensionalEffect({ progress: 0, time: 0 });
	let composer: EffectComposer | null = null;

	$effect(() => {
		const cam = camera.current;
		if (!cam) return;

		composer?.dispose();
		composer = new EffectComposer(renderer, {
			frameBufferType: HalfFloatType
		});
		composer.setSize(window.innerWidth, window.innerHeight);

		composer.addPass(new RenderPass(scene, cam));
		composer.addPass(new EffectPass(cam, invertEffect));
		autoRender.set(false);

		return () => {
			composer?.dispose();
			composer = null;
			autoRender.set(true);
		};
	});

	useTask(
		(delta) => {
			composer?.render(delta);
		},
		{ stage: renderStage, autoInvalidate: false }
	);

	let isInverted = $state(false);

	$effect(() => {
		if (!pointerData.isClicked || !isOnWorks) return;

		untrack(() => {
			isInverted = !isInverted;
			if (isInverted) {
				setActiveProject(currentIndex, currentProject);
			} else {
				setActiveProject(-1, null);
			}
		});
	});

	$effect(() => {
		gsap.to(invertEffect, {
			progress: isInverted ? 1 : 0,
			duration: 1.2,
			ease: 'circ.inOut'
		});
	});

	function handleNext(i: number) {
		if (isTransitioning || totalProjects < 2 || !isOnWorks || !projectStore.projects[i]) return;

		isTransitioning = true;
		const animState = { p: 0 };

		const tl = gsap.timeline({
			onUpdate: () => {
				progress = animState.p;
			},
			onComplete: () => {
				isTransitioning = false;
			}
		});

		tl.to(animState, { p: 1, duration: 0.6, ease: 'sine.inOut' });
		tl.add(() => {
			currentIndex = i;
		});
		tl.to(animState, { p: 0, duration: 0.6, ease: 'sine.inOut' });
	}

	$effect(() => {
		if (!isOnWorks || totalProjects === 0) return;

		const newIndex = Math.min(Math.floor(scrollData.y * totalProjects), totalProjects - 1);

		if (newIndex !== currentIndex) handleNext(newIndex);
	});
</script>

{#if currentProject}
	{#each projectStore.projects as project, i (project.id)}
		<T.Group position={[0, 4, 0]} visible={i === currentIndex && isOnWorks}>
			<ProjectPlane
				isVisible={i === currentIndex && isOnWorks}
				{progress}
				imageUrl={currentProject.image_thumbnail_url}
			/>
			<ProjectText {progress} title={currentProject.title} />
		</T.Group>
	{/each}
{/if}
