<script lang="ts">
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
		href: '/docs/example.txt'
	};
</script>

<svelte:window bind:innerWidth={windowWidth} />

<header class="fixed inset-0 size-full text-zinc-800">
	<!-- borders -->
	<!-- [T] -->
	<div class="absolute top-0 left-0 h-2 w-full bg-zinc-200"></div>
	<!-- [B] -->
	<div class="absolute bottom-0 left-0 h-2 w-full bg-zinc-200"></div>
	<!-- [L] -->
	<div class="absolute top-0 left-0 h-full w-2 bg-zinc-200"></div>
	<!-- [R] -->
	<div class="absolute top-0 right-0 h-full w-2 bg-zinc-200"></div>

	<!-- [TL] name -->
	<Trapezoid
		variant="TL"
		{slant}
		class="absolute top-0 left-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 pe-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:pe-[3.5rem]"
	>
		<p class="font-heading text-[18px] tracking-wide lowercase sm:text-[22px]">Ade Prastya</p>
	</Trapezoid>

	<!-- [TC] logo -->
	<Trapezoid
		variant="TC"
		{slant}
		class="absolute top-0 left-1/2 z-10 flex h-[1.8rem] -translate-x-1/2 items-center justify-center bg-zinc-200 px-[2.2rem] sm:h-[2rem] sm:px-[2.7rem]"
	>
		<SvgLogo class="size-6 fill-zinc-700 sm:size-7" />
	</Trapezoid>

	<!-- [TR] time -->
	<Trapezoid
		variant="TR"
		{slant}
		class="absolute top-0 right-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 ps-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:ps-[3.5rem]"
		><RealtimeClock />
	</Trapezoid>

	<!-- [BL] social links -->
	<Trapezoid
		variant="BL"
		{slant}
		class="absolute bottom-0 left-0 z-10 h-[1.8rem] min-w-[8rem] bg-zinc-200 px-2 pe-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:pe-[3.5rem]"
	>
		<SocialLinks />
	</Trapezoid>

	<!-- [BR] avail status -->
	<Trapezoid
		variant="BR"
		{slant}
		class="absolute right-0 bottom-0 z-10 flex h-[1.8rem] min-w-[8rem] items-center justify-center bg-zinc-200 px-2 ps-[2.2rem] sm:h-[2rem] sm:min-w-[10rem] sm:px-6 sm:ps-[3.5rem]"
	>
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
	</Trapezoid>

	<!-- [L1] fast messages -->
	<div class="absolute top-1/2 left-0 z-10 -translate-y-1/2">
		<MessageForm />
	</div>

	<!-- [R1] sound toggle -->
	<Trapezoid
		variant="R"
		slant="2rem"
		class="absolute top-1/4 right-0 z-10 -translate-y-1/2 bg-zinc-200 px-1.5 py-[2.2rem]"
	>
		<SoundToggle animate={isSoundOn} />
	</Trapezoid>

	<!-- [R2] navigation -->
	<div class="absolute right-0 bottom-1/4 z-10 w-fit translate-y-1/2">
		<Navigation />
	</div>

	<!-- CTA toast -->
	<div role="status" aria-live="polite" class="absolute top-10 left-5 z-50 sm:top-12 sm:left-6">
		<FrameToast {...toastCTA} />
	</div>
</header>
