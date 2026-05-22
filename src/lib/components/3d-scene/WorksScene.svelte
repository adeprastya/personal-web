<script lang="ts">
	import { HalfFloatType } from 'three';
	import gsap from 'gsap';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';

	import { AppRoute } from '$lib/types/Route';
	import { projectStore } from '$lib/stores/projects.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { scrollData } from '$lib/contexts/scroll.svelte';
	import {
		setActiveProject,
		setVisibility,
		activeProjectData
	} from '$lib/contexts/activeProject.svelte';

	import { DimensionalEffect } from '$lib/effects/DimensionalEffect';
	import ProjectPlane from './shared/ProjectPlane.svelte';

	let isOnWorks = $derived(routeData.current === AppRoute.works);
	let totalProjects = $derived(projectStore.projects.length);
	let currentIndex = $state(0);
	let isTransitioning = $state(false);
	let progress = $state(0);
	let currentProject = $derived(projectStore.projects[currentIndex] ?? null);
	let isHovered = $state(false);

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

	$effect(() => {
		gsap.to(invertEffect, {
			progress: activeProjectData.isVisible ? 1 : 0,
			duration: 1.2,
			ease: 'circ.inOut'
		});
	});

	$effect(() => {
		if (!isOnWorks || totalProjects === 0) return;

		const newIndex = Math.min(Math.floor(scrollData.y * totalProjects), totalProjects - 1);
		if (newIndex !== currentIndex) handleNext(newIndex);
	});

	$effect(() => {
		if (isHovered) {
			document.body.style.cursor = 'pointer';
		} else document.body.style.cursor = 'default';
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

	function handleClick() {
		setActiveProject(currentIndex, currentProject);
		setVisibility(true);
	}
</script>

{#if currentProject}
	{#each projectStore.projects as project, i (project.id)}
		<T.Group
			position={[0, 4, 0]}
			visible={i === currentIndex && isOnWorks}
			interactive={i === currentIndex && isOnWorks}
		>
			<ProjectPlane
				isVisible={i === currentIndex && isOnWorks}
				{progress}
				imageUrl={currentProject.image_thumbnail_url}
			/>
			<T.Mesh
				onclick={handleClick}
				onpointerenter={() => (isHovered = true)}
				onpointerleave={() => (isHovered = false)}
			>
				<Text
					text={currentProject.title}
					position={[0, 0, 0.5]}
					font="/fonts/Canterbury/Canterbury.ttf"
					fontSize={0.2}
					anchorX="center"
					anchorY="middle"
					color="#eee"
					fillOpacity={1 - progress}
				/>
			</T.Mesh>
		</T.Group>
	{/each}
{/if}
