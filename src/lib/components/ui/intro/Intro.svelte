<script lang="ts">
	import { gsap } from 'gsap';
	import type { TrapezoidVariant } from '$lib/types/TrapezoidVariants';
	import { SplitText } from 'gsap/SplitText';
	import { onMount } from 'svelte';
	import Trapezoid from '../shared/Trapezoid.svelte';
	import CircularLoader from './IntroLoader.svelte';

	const progressAnim = {
		totalMs: 1500, // total time for the progress bar to reach 100
		stepMs: 15
	};
	const textAnim = {
		duration: 0.8, // seconds
		stagger: 0.4 // seconds
	};

	type Curtain = {
		variant: TrapezoidVariant;
		position: string;
		closedTranslate: string;
	};
	const curtains: Curtain[] = [
		{ variant: 'BL', position: 'top-0 -left-0', closedTranslate: '-100% 0%' },
		{ variant: 'TR', position: 'top-0 right-0', closedTranslate: '100% -50%' },
		{ variant: 'TL', position: 'bottom-0 left-0', closedTranslate: '-100% 0%' },
		{ variant: 'BR', position: 'right-0 bottom-0', closedTranslate: '100% 50%' }
	];

	const progressStepCount = progressAnim.totalMs / progressAnim.stepMs;
	const progressIncrement = 100 / progressStepCount;

	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let isOpen = $state(true);
	let progress = $state(0);
	let h1El: HTMLHeadingElement | null = null;
	let split: SplitText | null = null;

	onMount(() => {
		document.fonts.ready.then(function animateInText() {
			split = new SplitText(h1El, { type: 'chars' });
			h1El?.classList.remove('invisible');

			if (prefersReducedMotion) {
				gsap.set(split.chars, { opacity: 1 });
			} else {
				gsap.from(split.chars, {
					opacity: 0,
					duration: textAnim.duration,
					ease: 'power3.out',
					stagger: { amount: textAnim.stagger, from: 'random' }
				});
			}
		});

		const step = prefersReducedMotion ? 100 : progressIncrement;
		const interval = setInterval(
			function incrementProgress() {
				progress = Math.min(progress + step, 100);
				if (progress >= 100) {
					clearInterval(interval);
					isOpen = false;
				}
			},
			prefersReducedMotion ? 0 : progressAnim.stepMs
		);

		return () => {
			clearInterval(interval);
			split?.revert();
		};
	});

	$effect(function animateOutText() {
		if (!isOpen && split && !prefersReducedMotion) {
			gsap.to(split.chars, {
				opacity: 0,
				duration: textAnim.duration,
				ease: 'power3.in',
				stagger: { amount: textAnim.stagger, from: 'center' }
			});
		}
	});
</script>

<div class="pointer-events-none fixed inset-0 flex size-full items-center justify-center">
	<!-- Curtain transition -->
	{#each curtains as { variant, position, closedTranslate } (variant)}
		<div
			class="absolute {position} transition-transform delay-1500 duration-2000 motion-reduce:transition-none"
			style="translate: {isOpen ? '0 0' : closedTranslate}"
		>
			<Trapezoid {variant} slant="30%" class="h-[50.04svh] w-[60vw] bg-zinc-200"
				><span></span></Trapezoid
			>
		</div>
	{/each}

	<h1
		bind:this={h1El}
		class="font-heading invisible relative z-10 flex -translate-y-1/4 flex-col flex-wrap gap-4 text-[5.5rem] leading-none tracking-tight text-zinc-950 text-shadow-lg sm:flex-row sm:gap-6 sm:text-[6rem] md:gap-8 md:text-[7rem] lg:gap-12 lg:text-[10rem] xl:gap-16 xl:text-[12rem]"
	>
		<span>Do</span>
		<span>It</span>
		<span>Yourself</span>
	</h1>

	<!-- Loader -->
	<div
		class="absolute bottom-12 left-1/2 -translate-x-1/2 {isOpen
			? 'opacity-100'
			: 'opacity-0'} transition-opacity delay-1200 duration-600 motion-reduce:transition-none"
	>
		<CircularLoader {progress} size={80} />
	</div>
</div>
