import { device } from '$lib/state/device.svelte';

class IntroState {
	private animationFrame?: number;
	private target = 0;

	public progress = $state(0);
	public isOpened = $state(false);
	public isCompleted = $state(false);

	public tick(to: number, speed = 60): void {
		this.target = Math.max(this.target, to);

		if (this.animationFrame) return;

		const multiplier = device.prefersReducedMotion ? 4 : 1;
		let previousTime = performance.now();
		let accumulated = this.progress;

		const animate = (time: number) => {
			const delta = (time - previousTime) / 1000;
			previousTime = time;

			accumulated += speed * multiplier * delta;
			this.progress = Math.min(this.target, Math.floor(accumulated));

			if (this.progress >= this.target) {
				this.animationFrame = undefined;

				if (this.target >= 100) {
					this.isCompleted = true;
				}

				return;
			}

			this.animationFrame = requestAnimationFrame(animate);
		};

		this.animationFrame = requestAnimationFrame(animate);
	}
}

export const intro = new IntroState();
