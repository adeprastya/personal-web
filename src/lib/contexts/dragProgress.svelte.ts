import { page } from '$app/state';
import gsap from 'gsap';
import { deviceData } from '$lib/contexts/device.svelte';
import { AppRoute } from '$lib/types/Route';

const smoothProgress = $state({ value: 0 });
let accumulated = 0;

export function updateDrag(dy: number) {
	const DRAG_NEEDED = deviceData.isMobile ? 1000 : 6000;

	accumulated = gsap.utils.clamp(0, DRAG_NEEDED, accumulated - dy);
	gsap.to(smoothProgress, {
		value: accumulated / DRAG_NEEDED,
		duration: 0.6,
		ease: 'power1.out',
		overwrite: true
	});
}

export function resetProgress() {
	gsap.killTweensOf(smoothProgress);
	accumulated = 0;
	smoothProgress.value = 0;
}

export function initDragProgress(getdy: () => number) {
	let rafId: number;
	function tick() {
		rafId = requestAnimationFrame(tick);
		const dy = getdy();
		if (dy !== 0) updateDrag(dy);
	}
	rafId = requestAnimationFrame(tick);
	return () => cancelAnimationFrame(rafId);
}

export const dragProgress = {
	get value() {
		return smoothProgress.value;
	},
	get home() {
		return page.url.pathname === AppRoute.home ? smoothProgress.value : 0;
	},
	get about() {
		return page.url.pathname === AppRoute.about ? smoothProgress.value : 0;
	},
	get works() {
		return page.url.pathname === AppRoute.works ? smoothProgress.value : 0;
	}
};
