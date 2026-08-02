<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { Draggable } from 'gsap/Draggable';
	import { InertiaPlugin } from 'gsap/InertiaPlugin';

	import { projectControl } from '$lib/state/projectControl.svelte';
	import { AppRoute } from '$lib/types/AppRoute';

	// --- Data & constants -----------------------------------------------

	const links = [
		{ href: AppRoute.Works, label: 'Works' },
		{ href: AppRoute.Home, label: 'Home' },
		{ href: AppRoute.About, label: 'About' }
	];

	const tickCount = 15; // number of tick marks along the track
	const diamondEase = 100; // damping scale for the diamond's motion while dragging

	// --- Refs & state -----------------------------------------------------

	// DOM element bindings, populated by bind:this in the markup below.
	type Refs = {
		container: HTMLElement | null;
		wrapper: HTMLElement | null;
		track: HTMLElement | null;
		diamond: HTMLElement | null;
	};
	const refs: Refs = { container: null, wrapper: null, track: null, diamond: null };

	// Index of the currently active item, derived from the URL on first render.
	let activeIdx = links.findIndex((link) => link.href === page.url.pathname);

	// Set once onMount runs, then called whenever the route changes so the
	// carousel repositions itself (e.g. browser back/forward navigation).
	let syncCarouselToRoute = $state<(() => void) | null>(null);

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = page.url.pathname;
		syncCarouselToRoute?.();
	});

	onMount(() => {
		const { container, wrapper, track, diamond } = refs;
		if (!container || !wrapper || !track || !diamond) return;

		gsap.registerPlugin(Draggable, InertiaPlugin);
		return setupCarousel(container, wrapper, track, diamond);
	});

	// --- Layout (pure calculations, no GSAP side effects) ------------------

	// Geometry derived from the container and item elements.
	type Layout = {
		containerCenter: number; // vertical center of the container, in px
		itemCenters: number[]; // vertical center of every item across all 3 copies
		itemStep: number; // px distance between two consecutive items
		groupHeight: number; // total height of one full set of nav links
		middleAnchorY: number; // wrapper Y that centers the middle list copy
	};

	// Measures the container and items to derive positioning/wrapping/snap values.
	function computeLayout(container: HTMLElement, items: HTMLElement[]): Layout {
		const containerCenter = container.offsetHeight / 2;
		const itemCenters = items.map((el) => el.offsetTop + el.offsetHeight / 2);
		const itemStep = itemCenters[1] - itemCenters[0];
		const groupHeight = links.length * itemStep;
		// The list is rendered 3x (triplicated) for infinite scroll; the center
		// anchor is calculated from the middle copy (index links.length).
		const middleAnchorY = containerCenter - itemCenters[links.length];

		return { containerCenter, itemCenters, itemStep, groupHeight, middleAnchorY };
	}

	// Finds the nearest target Y among the 3 list copies for a given route index.
	function closestTargetY(routeIndex: number, layout: Layout, currentY: number) {
		const candidateYs = [routeIndex, routeIndex + links.length, routeIndex + links.length * 2].map(
			(i) => layout.containerCenter - layout.itemCenters[i]
		);
		return candidateYs.reduce((closest, candidate) =>
			Math.abs(candidate - currentY) < Math.abs(closest - currentY) ? candidate : closest
		);
	}

	// --- GSAP setup (side effects: drag, opacity, animation) ----------------

	// Wires up the draggable carousel: layout, drag/inertia, opacity, diamond,
	// and route sync. Returns a cleanup function for onMount.
	function setupCarousel(
		container: HTMLElement,
		wrapper: HTMLElement,
		track: HTMLElement,
		diamond: HTMLElement
	) {
		const items = Array.from(wrapper.querySelectorAll('li')) as HTMLElement[];
		const layout = computeLayout(container, items);

		const wrapPositionY = gsap.utils.wrap(
			layout.middleAnchorY - layout.groupHeight / 2,
			layout.middleAnchorY + layout.groupHeight / 2
		);
		const wrapItemIndex = gsap.utils.wrap(0, items.length);

		let lastY = gsap.getProperty(wrapper, 'y') as number;
		let continuousIndex = activeIdx;

		const diamondMaxOffset = track.offsetHeight / 2;
		gsap.set(diamond, { xPercent: -50, yPercent: -50, y: 0 });

		// Reads the wrapper's current GSAP y transform.
		const currentWrapperY = () => gsap.getProperty(wrapper, 'y') as number;

		// The diamond follows the drag distance, but with exponential decay
		// damping so it never exceeds the track's bounds.
		function diamondOffsetFor(distance: number) {
			const sign = Math.sign(distance);
			const magnitude = diamondMaxOffset * (1 - Math.exp(-Math.abs(distance) / diamondEase));
			return sign * magnitude;
		}

		// Animates the diamond back to its resting position.
		function snapDiamondBack() {
			gsap.to(diamond, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.7)', overwrite: true });
		}

		// Recalculates each item's opacity based on distance from the container center.
		function updateItemOpacities() {
			const y = currentWrapperY();
			items.forEach((item, i) => {
				const distance = Math.abs(layout.itemCenters[i] + y - layout.containerCenter);
				gsap.set(item, { opacity: 1 - distance / layout.containerCenter });
			});
		}

		// Runs on every drag/throw tick: tracks scroll progress, moves the
		// diamond, wraps the wrapper position, and refreshes opacities.
		function handleDragUpdate(this: Draggable) {
			const rawY = currentWrapperY();

			continuousIndex += (lastY - rawY) / layout.itemStep;
			lastY = rawY;

			gsap.set(diamond, { y: diamondOffsetFor(this.y - this.startY) });

			const wrappedY = wrapPositionY(rawY);
			if (wrappedY !== rawY) {
				gsap.set(wrapper, { y: wrappedY });
				this.update();
				lastY = wrappedY;
			}

			updateItemOpacities();
		}

		// After a throw settles, navigates to the item nearest the center.
		function navigateToClosestItem() {
			const y = currentWrapperY();
			const distances = layout.itemCenters.map((c) => Math.abs(c + y - layout.containerCenter));
			const closestIndex = distances.indexOf(Math.min(...distances));

			const link = items[closestIndex].querySelector('a') as HTMLAnchorElement | null;
			if (!link) return;

			activeIdx = closestIndex;
			goto(link.href);
		}

		// Tweens continuousIndex toward targetIndex for a smooth settle.
		function animateContinuousIndexTo(targetIndex: number) {
			const tween = { value: continuousIndex };
			gsap.to(tween, {
				value: targetIndex,
				duration: 0.4,
				ease: 'power2.out',
				onUpdate: () => {
					continuousIndex = tween.value;
				}
			});
		}

		// Repositions the carousel to match the current route.
		function syncCarouselToActiveRoute() {
			const routeIndex = links.findIndex((link) => link.href === page.url.pathname);
			if (routeIndex === -1) return;

			const y = currentWrapperY();
			const targetY = closestTargetY(routeIndex, layout, y);

			gsap.to(wrapper, {
				y: targetY,
				duration: 0.3,
				onUpdate: updateItemOpacities,
				onComplete: () => {
					activeIdx = routeIndex;
					lastY = currentWrapperY();
				}
			});

			animateContinuousIndexTo(routeIndex);
			snapDiamondBack();
		}

		// Clicking the top half steps to the previous item, bottom half to the next.
		function handleContainerClick(e: MouseEvent) {
			const rect = container.getBoundingClientRect();
			const clickedTopHalf = e.clientY - rect.top < rect.height / 2;
			const direction = clickedTopHalf ? -1 : 1;

			const y = currentWrapperY();
			activeIdx = wrapItemIndex(activeIdx + direction);
			gsap.set(wrapper, { y: wrapPositionY(y - direction * layout.itemStep) });
			updateItemOpacities();

			const link = items[activeIdx].querySelector('a');
			if (link) goto(link.getAttribute('href')!);
		}

		// Expose the sync function so the $effect above can call it.
		syncCarouselToRoute = syncCarouselToActiveRoute;
		updateItemOpacities();

		Draggable.create(wrapper, {
			type: 'y',
			inertia: true,
			throwResistance: 1000,
			overshootTolerance: 0.05,
			onDrag: handleDragUpdate,
			onThrowUpdate: handleDragUpdate,
			onDragEnd: snapDiamondBack,
			snap: (endValue) => {
				const snapPoints = layout.itemCenters.map((c) => layout.containerCenter - c);
				return gsap.utils.snap(snapPoints, endValue);
			},
			onThrowComplete: navigateToClosestItem
		});

		container.addEventListener('click', handleContainerClick);

		return () => {
			Draggable.get(wrapper)?.kill();
			gsap.killTweensOf(diamond);
			container.removeEventListener('click', handleContainerClick);
		};
	}
</script>

<div class="relative mr-2 flex items-center justify-center gap-2">
	<!-- Infinite navigation links -->
	<nav
		bind:this={refs.container}
		aria-label="Primary Navigation"
		class="relative h-36 touch-none overflow-hidden select-none"
		style={`pointer-events: ${projectControl.isVisible ? 'none' : 'auto'}`}
	>
		<div bind:this={refs.wrapper}>
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(3) as _, copyIndex (copyIndex)}
				<ul aria-hidden={copyIndex !== 1} class="flex flex-col items-center">
					{#each links as { label, href }, i (i)}
						<li>
							<a
								{href}
								tabindex={copyIndex === 1 ? 0 : -1}
								class="pointer-events-none inline-block w-full cursor-grab px-2 py-2.5 text-center font-mono text-xs tracking-widest text-zinc-300 uppercase focus:bg-zinc-50/30 active:cursor-grabbing sm:py-3.5 sm:text-sm"
							>
								{label}
							</a>
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	</nav>

	<!-- Track decoration -->
	<div bind:this={refs.track} class="relative h-36 w-2.5 shrink-0" aria-hidden="true">
		<div
			bind:this={refs.diamond}
			class="absolute top-1/2 left-1/2 translate-x-1 will-change-transform"
		>
			<!-- Diamond tip -->
			<div
				class="size-2 rotate-45 bg-zinc-50 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))]"
			></div>
		</div>

		<div class="absolute inset-0 flex flex-col justify-between">
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(tickCount) as _, i (i)}
				<div class="h-px w-1.5 translate-x-0.5 self-center bg-zinc-50/30"></div>
			{/each}
		</div>
	</div>
</div>
