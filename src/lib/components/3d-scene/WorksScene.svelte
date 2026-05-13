<script lang="ts">
  import gsap from 'gsap';
  import { T } from '@threlte/core';
  import { projectStore } from '$lib/stores/projects.svelte';
  import { routeData } from '$lib/contexts/route.svelte';
  import { scrollData } from '$lib/contexts/scroll.svelte';
  import { AppRoute } from '$lib/types/Route';
  import ProjectPlane from './shared/ProjectPlane.svelte';
	import ProjectText from "./shared/ProjectText.svelte";

  let isOnWorks = $derived(routeData.current === AppRoute.works);  
  let totalProjects = $derived(projectStore.projects.length);
  let currentIndex = $state(0);
  let isTransitioning = $state(false);
  let progress = $state(0);  
  let currentProject = $derived(projectStore.projects[currentIndex] ?? null);

  function handleNext(i: number) {
    if (isTransitioning || totalProjects < 2 || !isOnWorks || !projectStore.projects[i]) return;
    
    isTransitioning = true;
    const animState = { p: 0 };

    const tl = gsap.timeline({
      onUpdate: () => { progress = animState.p },
      onComplete: () => {
        isTransitioning = false;
      }
    });

    tl.to(animState, {
      p: 1,
      duration: 0.6,
      ease: 'sine.inOut'
    });
    tl.add(() => { 
      currentIndex = i;
    });
    tl.to(animState, {
      p: 0,
      duration: 0.6,
      ease: 'sine.inOut'
    });
  }

  $effect(() => {
    if (!isOnWorks || totalProjects === 0) return;

    const newIndex = Math.min(
      Math.floor(scrollData.y * totalProjects), 
      totalProjects - 1
    );

    if (newIndex !== currentIndex) {
      handleNext(newIndex);
    }
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
      <ProjectText
        {progress}
        title={currentProject.title}
      />
    </T.Group>
  {/each}
{/if}
