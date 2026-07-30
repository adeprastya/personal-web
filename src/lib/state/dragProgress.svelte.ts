import type { AppRouteType } from '$lib/types/AppRoute';
import { page } from '$app/state';
import gsap from 'gsap';
import { device } from '$lib/state/device.svelte';

class DragProgressState {
	/** Base drag distance required to reach 100% progress. */
	private readonly DRAG_NEEDED = 1000;
	/** Multiplier applied to desktop devices. */
	private readonly DESKTOP_MULTIPLIER = 6;

	/** Smoothed progress value in the range of 0–1. */
	public value = $state(0);

	private accumulated = 0;
	private rafId = 0;
	private dragNeeded = this.DRAG_NEEDED;

	/**
	 * Initializes the drag threshold based on the current device.
	 *
	 * Call this after the device state has been initialized.
	 */
	init(getDy: () => number) {
		this.dragNeeded = device.isMobile
			? this.DRAG_NEEDED
			: this.DRAG_NEEDED * this.DESKTOP_MULTIPLIER;

		this.start(getDy);
	}

	/**
	 * Stops the RAF loop and resets the internal state.
	 */
	destroy() {
		this.stop();
		this.reset();
	}

	/**
	 * Updates the progress using the given drag delta.
	 *
	 * @param dy Vertical drag delta.
	 */
	update(dy: number) {
		// Accumulate drag distance and animate the exposed progress.
		this.accumulated = gsap.utils.clamp(0, this.dragNeeded, this.accumulated - dy);

		gsap.to(this, {
			value: this.accumulated / this.dragNeeded,
			duration: 0.6,
			ease: 'power1.out',
			overwrite: true
		});
	}

	/** Resets the accumulated drag and progress state. */
	reset() {
		// Stop active animations and restore the initial state.
		gsap.killTweensOf(this);

		this.accumulated = 0;
		this.value = 0;
	}

	/**
	 * Starts the internal RAF loop.
	 *
	 * @param getDy Function returning the current vertical drag delta.
	 */
	start(getDy: () => number) {
		// Prevent multiple RAF loops.
		if (this.rafId) return;

		const tick = () => {
			this.rafId = requestAnimationFrame(tick);

			const dy = getDy();

			if (dy !== 0) {
				this.update(dy);
			}
		};

		this.rafId = requestAnimationFrame(tick);
	}

	/** Stops the internal RAF loop. */
	stop() {
		cancelAnimationFrame(this.rafId);
		this.rafId = 0;
	}

	/**
	 * Sets the progress directly.
	 *
	 * @param value Target progress in the range of 0–1.
	 * @param duration Animation duration in seconds.
	 */
	set(value: number, duration = 0.5) {
		// Synchronize accumulated drag with the target progress.
		const progress = gsap.utils.clamp(0, 1, value);

		this.accumulated = progress * this.dragNeeded;

		gsap.to(this, {
			value: progress,
			duration,
			ease: 'power2.out',
			overwrite: true
		});
	}

	/**
	 * Returns the current progress only when the given route is active.
	 *
	 * @param route Target application route.
	 */
	is(route: AppRouteType) {
		return page.url.pathname === route ? this.value : 0;
	}
}

export const drag = new DragProgressState();
