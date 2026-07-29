import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

class PointerState {
	// Constants
	private static readonly VELOCITY_ALPHA = 0.25;

	// Internal
	private initialized = false;
	private observer: Observer | null = null;

	private rafId = 0;
	private wheelResetId = 0;
	private wheelActive = false;

	private pendingDx = 0;
	private pendingDy = 0;

	private prevX = 0;
	private prevY = 0;
	private prevTime = 0;

	private smoothVx = 0;
	private smoothVy = 0;

	// Public
	public x = $state(0);
	public y = $state(0);
	public isDown = $state(false);
	public isClicked = $state(false); // True for one RAF frame
	// Per-frame movement
	public dx = $state(0);
	public dy = $state(0);
	// Smoothed velocity (px/s)
	vx = $state(0);
	vy = $state(0);

	/**
	 * Initialize the state
	 *
	 * Must be called once in runtime before accessing the property
	 */
	init() {
		if (typeof window === 'undefined' || this.initialized) return;

		gsap.registerPlugin(Observer);

		this.x = window.innerWidth / 2;
		this.y = window.innerHeight / 2;
		this.prevTime = performance.now();

		this.rafId = requestAnimationFrame(this.tick);

		this.observer = Observer.create({
			target: window,
			type: 'pointer,touch,mouse,wheel',
			onChange: this.handleWheel,
			onPress: this.handlePress,
			onMove: this.handleMove,
			onRelease: this.handleRelease,
			onClick: this.handleClick
		});

		this.initialized = true;
	}

	destroy() {
		if (!this.initialized || !this.observer) return;

		cancelAnimationFrame(this.rafId);
		clearTimeout(this.wheelResetId);

		this.observer.kill();
		this.observer = null;

		this.initialized = false;
	}

	// Update orchestrator
	private tick = () => {
		this.rafId = requestAnimationFrame(this.tick);

		this.updateDelta();
		this.updateVelocity();
		this.decayVelocity();
		this.resetClick();

		this.wheelActive = false;
		this.prevTime = performance.now();
	};

	private updateDelta() {
		this.dx = this.pendingDx;
		this.dy = this.pendingDy;

		this.pendingDx = 0;
		this.pendingDy = 0;
	}

	private updateVelocity() {
		const now = performance.now();
		const dt = now - this.prevTime;

		if (dt <= 0) return;

		const instantVx = (this.dx / dt) * 1000;
		const instantVy = (this.dy / dt) * 1000;

		this.smoothVx += PointerState.VELOCITY_ALPHA * (instantVx - this.smoothVx);

		this.smoothVy += PointerState.VELOCITY_ALPHA * (instantVy - this.smoothVy);

		this.vx = this.smoothVx;
		this.vy = this.smoothVy;
	}

	private decayVelocity() {
		if (this.isDown || this.wheelActive) return;

		this.smoothVx *= 0.85;
		this.smoothVy *= 0.85;

		if (Math.abs(this.smoothVx) < 0.5) this.smoothVx = 0;
		if (Math.abs(this.smoothVy) < 0.5) this.smoothVy = 0;

		this.vx = this.smoothVx;
		this.vy = this.smoothVy;
	}

	private resetClick() {
		if (this.isClicked) {
			this.isClicked = false;
		}
	}

	private resetMotion() {
		this.pendingDx = 0;
		this.pendingDy = 0;

		this.smoothVx = 0;
		this.smoothVy = 0;

		this.dx = 0;
		this.dy = 0;

		this.vx = 0;
		this.vy = 0;
	}

	private handleWheel = (self: Observer) => {
		const e = self.event;

		if (!e || (e.type !== 'wheel' && e.type !== 'mousewheel')) return;

		// Match pointer drag direction.
		this.pendingDx -= self.deltaX;
		this.pendingDy -= self.deltaY;

		this.wheelActive = true;

		clearTimeout(this.wheelResetId);

		this.wheelResetId = window.setTimeout(() => {
			this.wheelActive = false;
			this.resetMotion();
		}, 150);
	};

	private handlePress = (self: Observer) => {
		const coords = this.getClientCoords(self.event);
		if (!coords) return;

		this.isDown = true;
		[this.x, this.y] = coords;
		[this.prevX, this.prevY] = coords;

		this.resetMotion();
	};

	private handleMove = (self: Observer) => {
		const coords = this.getClientCoords(self.event);
		if (!coords) return;

		[this.x, this.y] = coords;

		if (!this.isDown) return;

		this.pendingDx += coords[0] - this.prevX;
		this.pendingDy += coords[1] - this.prevY;

		[this.prevX, this.prevY] = coords;
	};

	private handleRelease = () => {
		this.isDown = false;
		this.resetMotion();
	};

	private handleClick = () => {
		this.isClicked = true;
		this.isDown = false;
	};

	private getClientCoords(event: Event | undefined): [number, number] | null {
		if (!event) return null;

		if (event instanceof TouchEvent) {
			if (!event.touches.length) return null;

			return [event.touches[0].clientX, event.touches[0].clientY];
		}

		if (event instanceof MouseEvent) {
			return [event.clientX, event.clientY];
		}

		return null;
	}
}

export const pointer = new PointerState();
