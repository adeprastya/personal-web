<script lang="ts">
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

	let windowWidth = $state(0);
	let slant = $derived(windowWidth < 640 ? '2rem' : '2.5rem');

	const isAvailable = true;
	const isSoundOn = false;
	const toastCTA = {
		text: 'Dive into my resume',
		href: '/docs/cv.pdf'
	};

	let nameEl: HTMLParagraphElement | null = null;
	let logoEl: HTMLDivElement | null = null;
	let clockEl: HTMLDivElement | null = null;
	let socialEl: HTMLDivElement | null = null;
	let availEl: HTMLDivElement | null = null;
	let messageEl: HTMLDivElement | null = null;
	let soundEl: HTMLDivElement | null = null;
	let navEl: HTMLDivElement | null = null;

	onMount(() => {
		gsap.set(nameEl, { y: '-100%', x: '-100%', opacity: 0 });
		gsap.set(logoEl, { y: '-100%', x: '0%', opacity: 0 });
		gsap.set(clockEl, { y: '-100%', x: '100%', opacity: 0 });
		gsap.set(socialEl, { y: '100%', x: '-100%', opacity: 0 });
		gsap.set(availEl, { y: '100%', x: '100%', opacity: 0 });
		gsap.set(messageEl, { y: '0%', x: '-100%', opacity: 0 });
		gsap.set(soundEl, { y: '0%', x: '100%', opacity: 0 });
		gsap.set(navEl, { opacity: 0 });

		const tl = gsap.timeline({
			defaults: { duration: 1.8, ease: 'power3.out' },
			delay: 1.0
		});

		tl.to(logoEl, { y: 0, x: 0, opacity: 1 })
			.to([nameEl, clockEl], { y: 0, x: 0, opacity: 1 }, '<0.9')
			.to([socialEl, availEl], { y: 0, x: 0, opacity: 1 }, '<0.9')
			.to([socialEl, availEl], { y: 0, x: 0, opacity: 1 }, '<0.9')
			.to([messageEl, soundEl], { y: 0, x: 0, opacity: 1 }, '<0.9')
			.to(navEl, { opacity: 1 }, '<0.9');
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />

<header class="fixed inset-0 size-full text-zinc-800">
	<!-- borders -->
	<div class="absolute top-0 left-0 h-2 w-full bg-zinc-200"></div>
	<!-- [T] -->
	<div class="absolute bottom-0 left-0 h-2 w-full bg-zinc-200"></div>
	<!-- [B] -->
	<div class="absolute top-0 left-0 h-full w-2 bg-zinc-200"></div>
	<!-- [L] -->
	<div class="absolute top-0 right-0 h-full w-2 bg-zinc-200"></div>
	<!-- [R] -->

	<!-- [TL] name -->
	<Trapezoid
		variant="TL"
		{slant}
		class="absolute top-0 left-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 pe-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:pe-[3.5rem]"
	>
		<p bind:this={nameEl} class="font-heading text-[18px] tracking-wide lowercase sm:text-[22px]">
			Ade Prastya
		</p>
	</Trapezoid>

	<!-- [TC] logo -->
	<Trapezoid
		variant="TC"
		{slant}
		class="absolute top-0 left-1/2 z-10 flex h-[1.8rem] -translate-x-1/2 items-center justify-center bg-zinc-200 px-[2.2rem] sm:h-[2rem] sm:px-[2.7rem]"
	>
		<div bind:this={logoEl}><SvgLogo class="size-6 fill-zinc-700 sm:size-7" /></div>
	</Trapezoid>

	<!-- [TR] time -->
	<Trapezoid
		variant="TR"
		{slant}
		class="absolute top-0 right-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 ps-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:ps-[3.5rem]"
	>
		<div bind:this={clockEl}><RealtimeClock /></div>
	</Trapezoid>

	<!-- [BL] social links -->
	<Trapezoid
		variant="BL"
		{slant}
		class="absolute bottom-0 left-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center bg-zinc-200 px-2 pe-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:pe-[3.5rem]"
	>
		<div bind:this={socialEl}><SocialLinks /></div>
	</Trapezoid>

	<!-- [BR] avail status -->
	<Trapezoid
		variant="BR"
		{slant}
		class="absolute right-0 bottom-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 ps-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:ps-[3.5rem]"
	>
		<div bind:this={availEl}>
			<p class="flex items-center gap-3 sm:gap-4">
				<span
					class="inline-block size-1.5 rotate-45 animate-pulse {isAvailable
						? 'bg-green-600'
						: 'bg-red-600'}"
				></span>
				<span class="font-heading text-[18px] lowercase sm:text-[22px]"
					>{isAvailable ? 'Open for work' : 'Currently working on'}</span
				>
			</p>
		</div>
	</Trapezoid>

	<!-- [L1] fast messages -->
	<div class="absolute top-1/2 left-0 z-10 -translate-y-1/2">
		<div bind:this={messageEl}>
			<MessageForm />
		</div>
	</div>

	<!-- [R1] sound toggle -->
	<Trapezoid
		variant="R"
		slant="2rem"
		class="absolute top-1/4 right-0 z-10 -translate-y-1/2 bg-zinc-200 px-1.5 py-[2.2rem]"
	>
		<div bind:this={soundEl}>
			<SoundToggle animate={isSoundOn} />
		</div>
	</Trapezoid>

	<!-- [R2] navigation -->
	<div class="absolute right-0 bottom-1/4 z-10 w-fit translate-y-1/2">
		<div bind:this={navEl}>
			<Navigation />
		</div>
	</div>

	<!-- CTA toast -->
	<div role="status" aria-live="polite" class="absolute top-10 left-5 z-50 sm:top-12 sm:left-6">
		<FrameToast {...toastCTA} />
	</div>
</header>
