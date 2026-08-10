<script lang="ts">
	import type { TrapezoidVariant } from '$lib/types/TrapezoidVariants';
	import { gsap } from 'gsap';
	import { SplitText } from 'gsap/SplitText';
	import { onMount } from 'svelte';
	import Trapezoid from '../shared/Trapezoid.svelte';
	import CircularLoader from './IntroLoader.svelte';
	import { audios } from '$lib/audio/sounds';
	import { cn } from '$lib/utils/tailwindHelpers';
	import { device } from '$lib/state/device.svelte';
	import { intro } from '$lib/state/intro.svelte';

	const textAnim = {
		duration: .8, // seconds
		stagger: .4 // seconds
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

	let h1El: HTMLHeadingElement | null = null;
	let split: SplitText | null = null;

	onMount(function animateInText() {
		document.fonts.ready
			.then(function animateInText() {
				split = new SplitText(h1El, { type: 'chars' });
				h1El?.classList.remove('invisible');

				if (device.prefersReducedMotion) {
					gsap.set(split.words, { opacity: 1 });
				} else {
					gsap.from(split.chars, {
						opacity: 0,
						duration: textAnim.duration,
						ease: 'power3.out',
						stagger: { amount: textAnim.stagger, from: 'center' }
					});
				}
			})
			.then(() => {
				intro.tick(20);
			});

		return function cleanup() {
			split?.revert();
		};
	});

	$effect(function animateOutText() {
		if (!intro.isOpened || !split) return;

		if (device.prefersReducedMotion) {
			gsap.set(split.words, { opacity: 1 });
		} else {
			gsap.to(split.chars, {
				opacity: 0,
				duration: textAnim.duration,
				ease: 'power3.in',
				stagger: { amount: textAnim.stagger, from: 'center' }
			});
		}
	});

	function handleStartClick(): void {
		intro.isOpened = true;
		audios.introClicking();
	}
</script>

<div class="pointer-events-none fixed inset-0 flex size-full items-center justify-center">
	<!-- Curtain transition -->
	{#each curtains as { variant, position, closedTranslate } (variant)}
		<div
			class="absolute {position} transition-transform delay-1500 duration-2000 motion-reduce:transition-none"
			style="translate: {!intro.isOpened ? '0 0' : closedTranslate}"
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
		class={cn(
			'absolute bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-800 motion-reduce:transition-none',
			intro.progress >= 100 ? 'opacity-0' : 'opacity-100'
		)}
	>
		<CircularLoader progress={intro.progress} size={80} />
	</div>

	<div
		class={cn(
			'group absolute bottom-2/8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 font-mono transition-opacity duration-1200',
			intro.isCompleted && !intro.isOpened ? 'animate-pulse opacity-100' : 'opacity-0',
			!intro.isOpened ? 'pointer-events-auto' : 'pointer-events-none'
		)}
	>
		<button
			onclick={handleStartClick}
			class="cursor-pointer text-sm text-neutral-800 uppercase hover:text-neutral-500"
			>[ Start ]</button
		>
		<div
			class="w-0 border-b-2 border-neutral-400 transition-[width] duration-1000 group-hover:w-3/4"
		></div>
	</div>
</div>
