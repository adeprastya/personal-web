<script lang="ts">
	import SvgDecor from '$lib/assets/icons/nav-decor.svg?component';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { Draggable } from 'gsap/Draggable';
	import { InertiaPlugin } from 'gsap/InertiaPlugin';

	const links = [
		{ href: '/works', label: 'Works' },
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' }
	];

	gsap.registerPlugin(Draggable, InertiaPlugin);
	let activeIdx = links.findIndex((l) => l.href === page.url.pathname);

	let containerEl: HTMLElement;
	let wrapperEl: HTMLElement;

	onMount(() => {
		const containerCenter = containerEl.offsetHeight / 2;
		const wrapperHeight = (wrapperEl.children[0] as HTMLElement).offsetHeight;

		const items = Array.from(wrapperEl.querySelectorAll('li'));
		const itemCenters = items.map((el) => el.offsetTop + el.offsetHeight / 2);

		const wrapIdx = gsap.utils.wrap(0, items.length);
		const wrapY = gsap.utils.wrap(-wrapperHeight, 0);

		function updateOpacity() {
			const y = gsap.getProperty(wrapperEl, 'y') as number;
			items.forEach((item, i) => {
				const itemCenter = itemCenters[i] + y;
				const distance = Math.abs(itemCenter - containerCenter);
				const opacity = 1 - distance / containerCenter;
				gsap.set(item, { opacity });
			});
		}

		function wrapPosition() {
			const y = gsap.getProperty(wrapperEl, 'y') as number;
			gsap.set(wrapperEl, { y: wrapY(y) });
			updateOpacity();
		}

		function updateAnimation() {
			items.forEach((item) => item.classList.remove('animate-glitch'));
			items[activeIdx].classList.add('animate-glitch');
		}

		function navigate() {
			const y = gsap.getProperty(wrapperEl, 'y') as number;
			const distances = itemCenters.map((center) => Math.abs(center + y - containerCenter));
			const closestIndex = distances.indexOf(Math.min(...distances));
			const link = items[closestIndex].querySelector('a') as HTMLAnchorElement;
			if (link) {
				activeIdx = closestIndex;
				updateAnimation();
				goto(link.href);
			}
		}

		function syncRouter() {
			const curIdx = links.findIndex((l) => l.href === page.url.pathname);
			if (curIdx !== -1) {
				const snapPoints = itemCenters.map((center) => containerCenter - center);
				const targetY = snapPoints[curIdx];
				gsap.to(wrapperEl, {
					y: targetY,
					duration: 0.3,
					onUpdate: wrapPosition,
					onComplete: () => {
						activeIdx = curIdx;
					}
				});
			}
		}

		syncRouter();
		gsap.set(wrapperEl, { y: 0 });
		updateOpacity();

		Draggable.create(wrapperEl, {
			type: 'y',
			inertia: true,
			throwResistance: 1500,
			overshootTolerance: 0.1,
			onDrag: wrapPosition,
			onThrowUpdate: wrapPosition,
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
				gsap.set(wrapperEl, { y: wrapY(y + wrapperHeight / 3) });
			} else {
				activeIdx = wrapIdx(activeIdx + 1);
				gsap.set(wrapperEl, { y: wrapY(y - wrapperHeight / 3) });
			}
			updateOpacity();

			const link = items[activeIdx].querySelector('a') as HTMLAnchorElement;
			if (link) {
				goto(link.getAttribute('href')!);
			}
		}
		containerEl.addEventListener('click', handleClick);

		return () => {
			const draggable = Draggable.get(wrapperEl);
			if (draggable) draggable.kill();
			containerEl.removeEventListener('click', handleClick);
		};
	});
</script>

<div class="relative flex items-center justify-center">
	<nav
		bind:this={containerEl}
		aria-label="Primary Navigation"
		class="h-36 touch-none overflow-hidden select-none"
	>
		<div bind:this={wrapperEl}>
			{#each Array(3) as _, i}
				<ul aria-hidden={i !== 1} class="flex flex-col items-center">
					{#each links as { label, href }}
						<li>
							<a
								{href}
								tabindex={i === 1 ? 0 : -1}
								class="pointer-events-none inline-block w-full cursor-grab px-2 py-3.5 text-center font-mono text-sm tracking-widest text-zinc-300 uppercase active:cursor-grabbing"
							>
								{label}
							</a>
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	</nav>

	<SvgDecor class="-me-[1px] h-36 fill-zinc-200" />
</div>
