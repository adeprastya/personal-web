<script lang="ts">
  import { gsap } from 'gsap';
  import { SplitText } from 'gsap/SplitText';
  import { onMount } from 'svelte';
  import Trapezoid from "./shared/Trapezoid.svelte";
  import CircularLoader from "./Loader.svelte";

  gsap.registerPlugin(SplitText);

  let isOpen = $state(true);
  let h1El: HTMLHeadingElement | null = null;
  let split: SplitText | null = null;

  onMount(() => {
    document.fonts.ready.then(() => {
      split = new SplitText(h1El, { type: 'chars' });

      h1El?.classList.remove('invisible');

      gsap.from(split.chars, {
        opacity: 0,
        filter: 'blur(12px)',
        duration: 0.8,
        ease: 'power3.out',
        stagger: { amount: 0.4, from: 'random' },
      });
    }); // Total 1.2s

    return () => split?.revert();
  });

  $effect(() => {
    if (!isOpen && split) {
      gsap.to(split.chars, {
        opacity: 0,
        filter: 'blur(12px)',
        duration: 0.8,
        ease: 'power3.in',
        stagger: { amount: 0.4, from: 'center' },
      }); // Total 1.2s
    }
  });

  let progress = $state(0);
  const interval = setInterval(() => {
    progress += 1;
    if (progress >= 100) {
      clearInterval(interval);
      isOpen = false;
    }
  }, 30);
</script>

<div class="fixed inset-0 size-full flex items-center justify-center pointer-events-none">
  <!-- Curtain transition -->
  <div class="absolute top-0 left-0 transition-transform duration-2000 delay-1500" style="translate: {isOpen ? '0 0' : '-100% 0%'}">
    <Trapezoid variant="BL" slant="30%"
      class="w-[60vw] h-[50vh] bg-zinc-200"
    ><span></span></Trapezoid>
  </div>
  <div class="absolute top-0 right-0 transition-transform duration-2000 delay-1500" style="translate: {isOpen ? '0 0' : '100% -50%'}">
    <Trapezoid variant="TR" slant="30%"
      class="w-[60vw] h-[50vh] bg-zinc-200"
    ><span></span></Trapezoid>
  </div>
  <div class="absolute bottom-0 left-0 transition-transform duration-2000 delay-1500" style="translate: {isOpen ? '0 0' : '-100% 0%'}">
    <Trapezoid variant="TL" slant="30%"
      class="w-[60vw] h-[50vh] bg-zinc-200"
    ><span></span></Trapezoid>
  </div>
  <div class="absolute bottom-0 right-0 transition-transform duration-2000 delay-1500" style="translate: {isOpen ? '0 0' : '100% 50%'}">
    <Trapezoid variant="BR" slant="30%"
      class="w-[60vw] h-[50vh] bg-zinc-200"
    ><span></span></Trapezoid>
  </div>

  <h1 
    bind:this={h1El}
    class="invisible -translate-y-1/4 relative z-10 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 font-heading text-[5.5rem] sm:text-[6rem] md:text-[7rem] lg:text-[10rem] xl:text-[12rem] tracking-tight leading-none text-zinc-950 text-shadow-lg">
    <span>Do</span>
    <span>It</span>
    <span>Yourself</span>
  </h1>

  <!-- Loader -->
  <div class="absolute bottom-12 left-1/2 -translate-x-1/2 {isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-600 delay-1200">
    <CircularLoader {progress} size={80} />
  </div>
</div>
