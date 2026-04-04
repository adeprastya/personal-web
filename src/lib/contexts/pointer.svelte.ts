import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

export const pointerData = $state({
	x: 0 as number,
	y: 0 as number,
	vx: 0 as number, // Velocity X
	vy: 0 as number, // Velocity Y
	isDown: false,
	isClicked: false,
	isInitialized: false,
	instance: null as Observer | null
});

export function initPointer() {
	if (typeof window === 'undefined' || pointerData.isInitialized) return;

	gsap.registerPlugin(Observer);

	pointerData.instance = Observer.create({
		target: window,
		type: 'pointer,touch,mouse',
		tolerance: 10,
		onMove: (self) => {
			pointerData.x = self.x || 0;
			pointerData.y = self.y || 0;
			pointerData.vx = self.velocityX;
			pointerData.vy = self.velocityY;
		},
		onPress: () => (pointerData.isDown = true),
		onRelease: () => (pointerData.isDown = false),
		onClick: () => {
			pointerData.isClicked = true;
			pointerData.isDown = false;
			setTimeout(() => {
				pointerData.isClicked = false;
			}, 50);
		}
	});

	pointerData.isInitialized = true;

	return () => {
		pointerData.instance?.kill();
		pointerData.isInitialized = false;
	};
}
