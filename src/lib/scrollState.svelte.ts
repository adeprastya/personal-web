import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

const SCROLL_CONFIG = {
	smooth: 2,
	smoothTouch: 0.05
};

export const scrollData = $state({
	y: 0,
	trigger: null as ScrollTrigger | null,
	smoother: null as ScrollSmoother | null,
	isInitialized: false as boolean
});

export function initScroll() {
	if (typeof window === 'undefined' || scrollData.isInitialized) return;

	gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

	scrollData.smoother = ScrollSmoother.create({
		smooth: SCROLL_CONFIG.smooth,
		smoothTouch: SCROLL_CONFIG.smoothTouch,
		wrapper: '#smooth-wrapper',
		content: '#smooth-content'
	});

	scrollData.trigger = ScrollTrigger.create({
		start: 0,
		end: 'max',
		scrub: 1,
		onUpdate: (self) => {
			const newProgress = Math.round(self.progress * 1000) / 1000;
			if (Math.abs(newProgress - scrollData.y) > 0.0001) {
				scrollData.y = newProgress;
			}
		}
	});

	scrollData.isInitialized = true;

	return () => {
		scrollData.smoother?.kill();
		scrollData.trigger?.kill();
		scrollData.isInitialized = false;
	};
}
