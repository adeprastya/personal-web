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
	private hoverActive = false;

	// Drag accumulators (only filled while isDown, or via wheel)
	private pendingDragDx = 0;
	private pendingDragDy = 0;
	private smoothDragVx = 0;
	private smoothDragVy = 0;

	// Hover accumulators (filled on every move, regardless of isDown)
	private pendingHoverDx = 0;
	private pendingHoverDy = 0;
	private smoothHoverVx = 0;
	private smoothHoverVy = 0;

	// Separate "previous position" trackers per channel
	private prevDragX = 0;
	private prevDragY = 0;
	private prevHoverX = 0;
	private prevHoverY = 0;

	private prevTime = 0;

	// Public
	public x = $state(0);
	public y = $state(0);
	public isDown = $state(false);
	public isClicked = $state(false); // True for one RAF frame

	// Drag delta / velocity
	public dragDx = $state(0);
	public dragDy = $state(0);
	public dragVx = $state(0);
	public dragVy = $state(0);

	// Hover delta / velocity
	public hoverDx = $state(0);
	public hoverDy = $state(0);
	public hoverVx = $state(0);
	public hoverVy = $state(0);

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

		const now = performance.now();
		const dt = now - this.prevTime;

		this.updateDelta();
		if (dt > 0) {
			this.updateVelocity(dt);
			this.decayVelocity();
		}
		this.resetClick();

		this.wheelActive = false;
		this.hoverActive = false;
		this.prevTime = now;
	};

	private updateDelta() {
		this.dragDx = this.pendingDragDx;
		this.dragDy = this.pendingDragDy;
		this.pendingDragDx = 0;
		this.pendingDragDy = 0;

		this.hoverDx = this.pendingHoverDx;
		this.hoverDy = this.pendingHoverDy;
		this.pendingHoverDx = 0;
		this.pendingHoverDy = 0;
	}

	private updateVelocity(dt: number) {
		// Drag velocity
		const instantDragVx = (this.dragDx / dt) * 1000;
		const instantDragVy = (this.dragDy / dt) * 1000;

		this.smoothDragVx += PointerState.VELOCITY_ALPHA * (instantDragVx - this.smoothDragVx);
		this.smoothDragVy += PointerState.VELOCITY_ALPHA * (instantDragVy - this.smoothDragVy);

		this.dragVx = this.smoothDragVx;
		this.dragVy = this.smoothDragVy;

		// Hover velocity
		const instantHoverVx = (this.hoverDx / dt) * 1000;
		const instantHoverVy = (this.hoverDy / dt) * 1000;

		this.smoothHoverVx += PointerState.VELOCITY_ALPHA * (instantHoverVx - this.smoothHoverVx);
		this.smoothHoverVy += PointerState.VELOCITY_ALPHA * (instantHoverVy - this.smoothHoverVy);

		this.hoverVx = this.smoothHoverVx;
		this.hoverVy = this.smoothHoverVy;
	}

	private decayVelocity() {
		// Decay drag velocity when not actively dragging/wheeling
		if (!this.isDown && !this.wheelActive) {
			this.smoothDragVx *= 0.85;
			this.smoothDragVy *= 0.85;

			if (Math.abs(this.smoothDragVx) < 0.5) this.smoothDragVx = 0;
			if (Math.abs(this.smoothDragVy) < 0.5) this.smoothDragVy = 0;

			this.dragVx = this.smoothDragVx;
			this.dragVy = this.smoothDragVy;
		}

		// Decay hover velocity when pointer isn't moving this frame
		if (!this.hoverActive) {
			this.smoothHoverVx *= 0.85;
			this.smoothHoverVy *= 0.85;

			if (Math.abs(this.smoothHoverVx) < 0.5) this.smoothHoverVx = 0;
			if (Math.abs(this.smoothHoverVy) < 0.5) this.smoothHoverVy = 0;

			this.hoverVx = this.smoothHoverVx;
			this.hoverVy = this.smoothHoverVy;
		}
	}

	private resetClick() {
		if (this.isClicked) {
			this.isClicked = false;
		}
	}

	private resetDragMotion() {
		this.pendingDragDx = 0;
		this.pendingDragDy = 0;
		this.smoothDragVx = 0;
		this.smoothDragVy = 0;
		this.dragDx = 0;
		this.dragDy = 0;
		this.dragVx = 0;
		this.dragVy = 0;
	}

	private handleWheel = (self: Observer) => {
		const e = self.event;

		if (!e || (e.type !== 'wheel' && e.type !== 'mousewheel')) return;

		// Treat wheel as drag-equivalent input
		this.pendingDragDx -= self.deltaX;
		this.pendingDragDy -= self.deltaY;

		this.wheelActive = true;

		clearTimeout(this.wheelResetId);

		this.wheelResetId = window.setTimeout(() => {
			this.wheelActive = false;
			this.resetDragMotion();
		}, 150);
	};

	private handlePress = (self: Observer) => {
		const coords = this.getClientCoords(self.event);
		if (!coords) return;

		this.isDown = true;
		[this.x, this.y] = coords;
		[this.prevDragX, this.prevDragY] = coords;

		this.resetDragMotion();
	};

	private handleMove = (self: Observer) => {
		const coords = this.getClientCoords(self.event);
		if (!coords) return;

		this.x = coords[0];
		this.y = coords[1];

		// --- Hover channel: always tracked ---
		this.pendingHoverDx += coords[0] - this.prevHoverX;
		this.pendingHoverDy += coords[1] - this.prevHoverY;
		[this.prevHoverX, this.prevHoverY] = coords;
		this.hoverActive = true;

		// --- Drag channel: only while pressed ---
		if (!this.isDown) return;

		this.pendingDragDx += coords[0] - this.prevDragX;
		this.pendingDragDy += coords[1] - this.prevDragY;
		[this.prevDragX, this.prevDragY] = coords;
	};

	private handleRelease = () => {
		this.isDown = false;
		this.resetDragMotion();
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
