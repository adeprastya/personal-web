<script lang="ts">
	import { PUBLIC_IS_OPEN_TO_WORK } from '$env/static/public';
	import { booleanCast } from '$lib/utils/envHelpers';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	import SvgLogo from '$lib/assets/icons/logo.svg?component';
	import Trapezoid from '$lib/components/shared/Trapezoid.svelte';
	import RealtimeClock from './RealtimeClock.svelte';
	import MessageForm from './MessageForm.svelte';
	import SoundToggle from './SoundToggle.svelte';
	import Navigation from './Navigation.svelte';
	import SocialLinks from './SocialLinks.svelte';
	import FrameToast from './FrameToast.svelte';
	import GyroCompassHUDEffect from '$lib/components/frame/GyroCompassHUDEffect.svelte';

	const isOpenToWork = booleanCast(PUBLIC_IS_OPEN_TO_WORK);
	let windowWidth = $state(0);
	let slant = $derived(windowWidth < 640 ? '2rem' : '2.5rem');

	type Refs = {
		name: HTMLElement | null;
		logo: HTMLElement | null;
		clock: HTMLElement | null;
		social: HTMLElement | null;
		avail: HTMLElement | null;
		message: HTMLElement | null;
		sound: HTMLElement | null;
		nav: HTMLElement | null;
		toast: HTMLElement | null;
		decor: HTMLElement | null;
	};
	const refs: Refs = {
		name: null,
		logo: null,
		clock: null,
		social: null,
		avail: null,
		message: null,
		sound: null,
		nav: null,
		toast: null,
		decor: null
	};

	onMount(function animateEnteringRefs() {
		gsap.set(refs.name, { y: '-100%', x: '-100%', opacity: 0 });
		gsap.set(refs.logo, { y: '-100%', x: '0%', opacity: 0 });
		gsap.set(refs.clock, { y: '-100%', x: '100%', opacity: 0 });
		gsap.set(refs.social, { y: '100%', x: '-100%', opacity: 0 });
		gsap.set(refs.avail, { y: '100%', x: '100%', opacity: 0 });
		gsap.set(refs.message, { y: '0%', x: '-100%', opacity: 0 });
		gsap.set(refs.sound, { y: '0%', x: '100%', opacity: 0 });
		gsap.set(refs.nav, { opacity: 0 });
		gsap.set(refs.toast, { opacity: 0 });
		gsap.set(refs.decor, { opacity: 0 });

		const tl = gsap.timeline({
			defaults: { duration: 1.4, ease: 'power2.out' },
			delay: 1.0
		});

		tl.to(refs.logo, { y: 0, x: 0, opacity: 1 })
			.to([refs.name, refs.clock], { y: 0, x: 0, opacity: 1 }, '<0.6')
			.to([refs.social, refs.avail], { y: 0, x: 0, opacity: 1 }, '<0.6')
			.to([refs.social, refs.avail], { y: 0, x: 0, opacity: 1 }, '<0.6')
			.to([refs.message, refs.sound], { y: 0, x: 0, opacity: 1 }, '<0.6')
			.to(refs.nav, { opacity: 1 }, '<0.4')
			.to(refs.toast, { opacity: 1 }, '<0.4')
			.to(refs.decor, { opacity: 1 }, '<0.4');
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />

<header class="pointer-events-none fixed inset-0 size-full text-zinc-800">
	<!-- Borders -->
	<div class="absolute top-0 left-0 h-2 w-full bg-zinc-200"></div>
	<!-- [T] -->
	<div class="absolute bottom-0 left-0 h-2 w-full bg-zinc-200"></div>
	<!-- [B] -->
	<div class="absolute top-0 left-0 h-full w-2 bg-zinc-200"></div>
	<!-- [L] -->
	<div class="absolute top-0 right-0 h-full w-2 bg-zinc-200"></div>
	<!-- [R] -->

	<!-- Name [TL] -->
	<Trapezoid
		variant="TL"
		{slant}
		class="pointer-events-auto absolute top-0 left-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 pe-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:pe-[3.5rem]"
	>
		<p
			bind:this={refs.name}
			class="font-heading text-[18px] tracking-wide lowercase opacity-0 sm:text-[22px]"
		>
			Ade Prastya
		</p>
	</Trapezoid>

	<!-- Logo [TC] -->
	<Trapezoid
		variant="TC"
		{slant}
		class="pointer-events-auto absolute top-0 left-1/2 z-10 flex h-[1.8rem] -translate-x-1/2 items-center justify-center bg-zinc-200 px-[2.2rem] sm:h-[2rem] sm:px-[2.7rem]"
	>
		<div bind:this={refs.logo} class="opacity-0">
			<SvgLogo class="size-6 fill-zinc-700 sm:size-7" />
		</div>
	</Trapezoid>

	<!-- Time [TR] -->
	<Trapezoid
		variant="TR"
		{slant}
		class="pointer-events-auto absolute top-0 right-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 ps-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:ps-[3.5rem]"
	>
		<div bind:this={refs.clock} class="opacity-0"><RealtimeClock /></div>
	</Trapezoid>

	<!-- Social links [BL] -->
	<Trapezoid
		variant="BL"
		{slant}
		class="pointer-events-auto absolute bottom-0 left-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center bg-zinc-200 px-2 pe-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:pe-[3.5rem]"
	>
		<div bind:this={refs.social} class="opacity-0"><SocialLinks /></div>
	</Trapezoid>

	<!-- Avail status [BR] -->
	<Trapezoid
		variant="BR"
		{slant}
		class="pointer-events-auto absolute right-0 bottom-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 ps-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:ps-[3.5rem]"
	>
		<div bind:this={refs.avail} class="opacity-0">
			<p class="flex items-center gap-3 sm:gap-4">
				<span
					class="inline-block size-1.5 rotate-45 animate-pulse {isOpenToWork
						? 'bg-green-600'
						: 'bg-red-600'}"
				></span>
				<span class="font-heading text-[18px] lowercase sm:text-[22px]"
					>{isOpenToWork ? 'Open for work' : 'Currently working on'}</span
				>
			</p>
		</div>
	</Trapezoid>

	<!-- Fast messages [L1] -->
	<div class="pointer-events-auto absolute top-1/2 left-0 z-10 -translate-x-full -translate-y-1/2">
		<div bind:this={refs.message} class="opacity-0">
			<MessageForm />
		</div>
	</div>

	<!-- Sound toggle [R1] -->
	<Trapezoid
		variant="R"
		slant="2rem"
		class="pointer-events-auto absolute top-1/4 right-0 z-10 -translate-y-1/2 bg-zinc-200 px-1.5 py-[2.2rem]"
	>
		<div bind:this={refs.sound} class="opacity-0">
			<SoundToggle />
		</div>
	</Trapezoid>

	<!-- Nnavigation [R2] -->
	<div class="pointer-events-auto absolute right-0 bottom-1/4 z-10 w-fit translate-y-1/2">
		<div bind:this={refs.nav} class="opacity-0">
			<Navigation />
		</div>
	</div>

	<!-- CTA toast [TL] -->
	<div class="pointer-events-auto absolute top-18 left-6 z-50 sm:top-14 sm:left-8">
		<div bind:this={refs.toast} class="opacity-0">
			<FrameToast />
		</div>
	</div>

	<!-- Gyro compass decoration [TC] -->
	<div class="pointer-events-none absolute top-10 left-1/2 z-10 -translate-x-1/2">
		<div bind:this={refs.decor} class="opacity-0">
			<GyroCompassHUDEffect />
		</div>
	</div>
</header>
