<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { Draggable } from 'gsap/Draggable';
	import { InertiaPlugin } from 'gsap/InertiaPlugin';

	import { activeProjectData } from '$lib/contexts/activeProject.svelte';
	import { AppRoute } from '$lib/types/Route';

	const links = [
		{ href: AppRoute.works, label: 'Works', tick: '16' },
		{ href: AppRoute.home, label: 'Home', tick: '48' },
		{ href: AppRoute.about, label: 'About', tick: '80' }
	];

	const TICK_COUNT = 15;
	const DIAMOND_EASE_SCALE = 120;

	let syncFn = $state<(() => void) | null>(null);

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = page.url.pathname;
		syncFn?.();
	});

	let activeIdx = links.findIndex((l) => l.href === page.url.pathname);

	let containerEl: HTMLElement;
	let wrapperEl: HTMLElement;
	let trackEl: HTMLElement;
	let diamondEl: HTMLElement;

	onMount(() => {
		gsap.registerPlugin(Draggable, InertiaPlugin);

		const containerCenter = containerEl.offsetHeight / 2;

		const items = Array.from(wrapperEl.querySelectorAll('li'));
		const itemCenters = items.map((el) => el.offsetTop + el.offsetHeight / 2);
		const itemStep = itemCenters[1] - itemCenters[0];

		const groupHeight = links.length * itemStep;

		const middleAnchorY = containerCenter - itemCenters[links.length];
		const wrapY = gsap.utils.wrap(middleAnchorY - groupHeight / 2, middleAnchorY + groupHeight / 2);

		const wrapIdx = gsap.utils.wrap(0, items.length);

		let continuousIndex = activeIdx;
		let lastY = gsap.getProperty(wrapperEl, 'y') as number;

		const diamondMaxOffset = trackEl.offsetHeight / 2;
		gsap.set(diamondEl, { xPercent: -50, yPercent: -50, y: 0 });

		function diamondOffset(distance: number) {
			const sign = Math.sign(distance);
			return sign * diamondMaxOffset * (1 - Math.exp(-Math.abs(distance) / DIAMOND_EASE_SCALE));
		}

		function updateOpacity() {
			const y = gsap.getProperty(wrapperEl, 'y') as number;
			items.forEach((item, i) => {
				const itemCenter = itemCenters[i] + y;
				const distance = Math.abs(itemCenter - containerCenter);
				const opacity = 1 - distance / containerCenter;
				gsap.set(item, { opacity });
			});
		}

		function refreshVisuals() {
			updateOpacity();
		}

		function handleDragUpdate(this: Draggable) {
			const rawY = gsap.getProperty(wrapperEl, 'y') as number;

			continuousIndex += (lastY - rawY) / itemStep;
			lastY = rawY;

			const distance = this.y - this.startY;
			gsap.set(diamondEl, { y: diamondOffset(distance) });

			const wrapped = wrapY(rawY);
			if (wrapped !== rawY) {
				gsap.set(wrapperEl, { y: wrapped });
				this.update();
				lastY = wrapped;
			}

			refreshVisuals();
		}

		function navigate() {
			const y = gsap.getProperty(wrapperEl, 'y') as number;
			const distances = itemCenters.map((center) => Math.abs(center + y - containerCenter));
			const closestIndex = distances.indexOf(Math.min(...distances));
			const link = items[closestIndex].querySelector('a') as HTMLAnchorElement;
			if (link) {
				activeIdx = closestIndex;
				goto(link.href);
			}
		}

		function syncRouter() {
			const curIdx = links.findIndex((l) => l.href === page.url.pathname);
			if (curIdx === -1) return;

			const y = gsap.getProperty(wrapperEl, 'y') as number;

			const candidates = [curIdx, curIdx + links.length, curIdx + links.length * 2].map(
				(i) => containerCenter - itemCenters[i]
			);
			const targetY = candidates.reduce((closest, candidate) =>
				Math.abs(candidate - y) < Math.abs(closest - y) ? candidate : closest
			);

			gsap.to(wrapperEl, {
				y: targetY,
				duration: 0.3,
				onUpdate: updateOpacity,
				onComplete: () => {
					activeIdx = curIdx;
					lastY = gsap.getProperty(wrapperEl, 'y') as number;
				}
			});

			const progressTween = { value: continuousIndex };
			gsap.to(progressTween, {
				value: curIdx,
				duration: 0.4,
				ease: 'power2.out',
				onUpdate: () => {
					continuousIndex = progressTween.value;
				}
			});

			gsap.to(diamondEl, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.7)', overwrite: true });
		}

		syncFn = syncRouter;
		updateOpacity();

		Draggable.create(wrapperEl, {
			type: 'y',
			inertia: true,
			throwResistance: 1000,
			overshootTolerance: 0.05,
			onDrag: handleDragUpdate,
			onThrowUpdate: handleDragUpdate,
			onDragEnd: () => {
				gsap.to(diamondEl, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.7)', overwrite: true });
			},
			snap: (endVal) => {
				const snapPoints = itemCenters.map((center) => containerCenter - center);
				return gsap.utils.snap(snapPoints, endVal);
			},
			onThrowComplete: navigate
		});

		function handleClick(e: MouseEvent) {
			const rect = containerEl.getBoundingClientRect();
			const clickY = e.clientY - rect.top;

			const y = gsap.getProperty(wrapperEl, 'y') as number;
			if (clickY < rect.height / 2) {
				activeIdx = wrapIdx(activeIdx - 1);
				gsap.set(wrapperEl, { y: wrapY(y + itemStep) });
			} else {
				activeIdx = wrapIdx(activeIdx + 1);
				gsap.set(wrapperEl, { y: wrapY(y - itemStep) });
			}
			refreshVisuals();

			const link = items[activeIdx].querySelector('a') as HTMLAnchorElement;
			if (link) {
				goto(link.getAttribute('href')!);
			}
		}
		containerEl.addEventListener('click', handleClick);

		return () => {
			const draggable = Draggable.get(wrapperEl);
			if (draggable) draggable.kill();
			gsap.killTweensOf(diamondEl);
			containerEl.removeEventListener('click', handleClick);
		};
	});
</script>

<div class="relative mr-2 flex items-center justify-center gap-2">
	<nav
		bind:this={containerEl}
		aria-label="Primary Navigation"
		class="relative h-36 touch-none overflow-hidden select-none"
		style={`pointer-events: ${activeProjectData.isVisible ? 'none' : 'auto'}`}
	>
		<div bind:this={wrapperEl}>
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(3) as _, i (i)}
				<ul aria-hidden={i !== 1} class="flex flex-col items-center">
					{#each links as { label, href }, i (i)}
						<li>
							<a
								{href}
								tabindex={i === 1 ? 0 : -1}
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

	<!-- Track -->
	<div bind:this={trackEl} class="relative h-36 w-2.5 shrink-0" aria-hidden="true">
		<div
			bind:this={diamondEl}
			class="absolute top-1/2 left-1/2 translate-x-1 will-change-transform"
		>
			<!-- Diamond tip -->
			<div
				class="size-2 rotate-45 bg-zinc-50 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))]"
			></div>
		</div>

		<div class="absolute inset-0 flex flex-col justify-between">
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(TICK_COUNT) as _, i (i)}
				<div class="h-px w-1.5 translate-x-0.5 self-center bg-zinc-50/30"></div>
			{/each}
		</div>
	</div>
</div>
