<script lang="ts">
	import gsap from 'gsap';
	import { routeData } from '$lib/contexts/route.svelte';
	import { pointerData } from '$lib/contexts/pointer.svelte';
	import { projectStore } from '$lib/stores/projects.svelte';
	import { AppRoute } from '$lib/types/Route';
	import ProjectPlane from './shared/ProjectPlane.svelte';

	let isOnWorks = $derived(routeData.current === AppRoute.works);

	let currentIndex = $state(0);
	let isTransitioning = $state(false);
	let progress = $state(0);

	function handleNext() {
		if (isTransitioning || projectStore.projects.length < 2 || !isOnWorks) return;
		isTransitioning = true;

		const animState = { p: 0 };

		const tl = gsap.timeline({
			onUpdate: () => {
				progress = animState.p;
			},
			onComplete: () => {
				progress = 0;
				isTransitioning = false;
			}
		});

		// Animate progress to 1
		tl.to(animState, {
			p: 1,
			duration: 1.0,
			ease: 'sine'
		});
		// Switch project at the end of the animation
		tl.add(() => {
			currentIndex = (currentIndex + 1) % projectStore.projects.length;
		});
		// Animate progress back to 0
		tl.to(animState, {
			p: 0,
			duration: 1.2,
			ease: 'sine'
		});
	}

	$effect(() => {
		if (pointerData.isClicked) handleNext();
	});
</script>

{#each projectStore.projects as project, i (project.id)}
	<ProjectPlane
		imageUrl={project.image_thumbnail_url}
		isVisible={i === currentIndex && isOnWorks}
		{progress}
		onClick={handleNext}
	/>
{/each}
