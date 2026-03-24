<script lang="ts">
  import { onMount, onDestroy } from "svelte";
	import { page } from '$app/state';
	import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import gsap from "gsap";
  import { Observer } from "gsap/Observer";
  import { scrollData } from "$lib/scrollState.svelte";

	let { routes } = $props<{ routes: string[] }>();

  const REQUIRED_PROGRESS = 4000;
  const DRAIN_SPEED = 2.5;

  let isMobile = false;
  let observer: Observer;
	let drainTicker: gsap.TickerCallback | null = null;

  let show = $state(false);
  let progress = $state(0);
  let progressRatio = $derived(progress / REQUIRED_PROGRESS);

  // Progress reset if not showing
  $effect(() => {
    show = scrollData.y >= 0.98;
    if (!show) progress = 0;
  });

  onMount(() => {
    gsap.registerPlugin(Observer);

		// Navigate
		function handleComplete() {
			const curIdx = routes.findIndex((l: string) => l === page.url.pathname);
			if (curIdx === -1) return;
			const nextPath = routes[(curIdx + 1) % routes.length];
			goto(nextPath);
		}

    const ua = navigator.userAgent;
    isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

		// Progress draining
    drainTicker = gsap.ticker.add(() => {
    	if (progress > 0) progress = Math.max(0, progress - DRAIN_SPEED);
  	});

		// Scroll observer
    observer = Observer.create({
      type: "wheel,touch,pointer",
      preventDefault: false,
      tolerance: 10,
      onChangeY: (self) => {
        if (!show) return;

        if (isMobile) {
          progress = Math.min(progress + Math.min(100, Math.abs(self.deltaY * 50)), REQUIRED_PROGRESS);
        } else {
          progress = Math.min(progress + Math.min(50, Math.abs(self.deltaY)), REQUIRED_PROGRESS);
        }

        if (progress >= REQUIRED_PROGRESS - 10) handleComplete();
      },
    });
  });

  onDestroy(() => {
    observer?.kill();
		if (drainTicker) gsap.ticker.remove(drainTicker);
  });
</script>

{#if show}
  <div transition:fade class="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
    <p class="mb-2 font-mono text-2xs sm:text-xs uppercase tracking-widest text-zinc-300">
      Keep scrolling
    </p>

    <div class="overflow-hidden w-[25vw] h-3 box-border border border-zinc-200/50 bg-zinc-200/15">
      <div
        class="size-full bg-zinc-200"
        style="transform: translateX({progressRatio * 110 - 110}%) skewX(45deg) scaleX(1.1);"
      ></div>
    </div>
  </div>
{/if}
