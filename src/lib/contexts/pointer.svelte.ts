import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

interface PointerData {
	/** Posisi absolut kursor/jari di layar */
	x: number;
	y: number;
	/**
	 * Delta PER-FRAME: seberapa jauh pointer bergerak sejak frame RAF sebelumnya.
	 * Ini yang harus dibaca oleh konsumer (Three.js, dll).
	 * Selalu di-reset ke 0 setiap awal frame, lalu diisi ulang.
	 */
	dx: number;
	dy: number;
	/**
	 * Velocity rolling average (px/s).
	 * Dihitung manual — bukan dari Observer — agar stabil.
	 */
	vx: number;
	vy: number;
	/** Apakah pointer sedang ditekan */
	isDown: boolean;
	/** Sinyal click (true selama 1 frame RAF) */
	isClicked: boolean;
	isInitialized: boolean;
	instance: Observer | null;
}

export const pointerData = $state<PointerData>({
	// Posisi absolut kursor/jari di layar (clientX/Y).
	x: 0,
	y: 0,
	// Delta PER-FRAME — seberapa jauh pointer bergerak sejak frame RAF sebelumnya.
	// Di-reset ke 0 setiap awal frame oleh RAF loop, lalu diisi ulang oleh event.
	dx: 0,
	dy: 0,
	// Kecepatan dalam px/s, dihitung manual via rolling average.
	// Diredam 15%/frame saat tidak ada input; snap ke 0 saat < 0.5 px/s.
	vx: 0,
	vy: 0,
	// true selama pointer ditekan (mouse down / jari menyentuh layar).
	isDown: false,
	// Sinyal click — true hanya selama 1 frame RAF, lalu otomatis kembali false.
	isClicked: false,
	isInitialized: false,
	instance: null
});

// ---------------------------------------------------------------------------
// INTERNAL
// ---------------------------------------------------------------------------

/**
 * Buffer mentah yang diakumulasi antara dua frame RAF.
 * Konsumer TIDAK membaca ini secara langsung.
 */
const raw = {
	/** Akumulasi delta sejak frame terakhir (dari mouse/touch move) */
	pendingDx: 0,
	pendingDy: 0,
	/** Untuk hitung velocity: posisi di frame sebelumnya */
	prevX: 0,
	prevY: 0,
	prevTime: 0,
	/** Rolling velocity (low-pass filter) */
	smoothVx: 0,
	smoothVy: 0
};

/** Handle untuk RAF loop */
let rafId = 0;
/** Handle untuk debounce reset wheel */
let wheelResetId = 0;
/** Apakah ada input wheel aktif frame ini */
let wheelActive = false;
// Konstanta rolling average (0 = tidak di-smooth, 1 = tidak pernah update)
const VELOCITY_ALPHA = 0.25;

function tick() {
	rafId = requestAnimationFrame(tick);

	const now = performance.now();
	const dt = now - raw.prevTime;

	pointerData.dx = raw.pendingDx;
	pointerData.dy = raw.pendingDy;

	raw.pendingDx = 0;
	raw.pendingDy = 0;

	if (dt > 0) {
		const instantVx = (pointerData.dx / dt) * 1000;
		const instantVy = (pointerData.dy / dt) * 1000;

		raw.smoothVx = raw.smoothVx + VELOCITY_ALPHA * (instantVx - raw.smoothVx);
		raw.smoothVy = raw.smoothVy + VELOCITY_ALPHA * (instantVy - raw.smoothVy);
	}

	const hasInput = pointerData.isDown || wheelActive;
	if (!hasInput) {
		raw.smoothVx *= 0.85;
		raw.smoothVy *= 0.85;

		if (Math.abs(raw.smoothVx) < 0.5) raw.smoothVx = 0;
		if (Math.abs(raw.smoothVy) < 0.5) raw.smoothVy = 0;
	}

	pointerData.vx = raw.smoothVx;
	pointerData.vy = raw.smoothVy;

	if (pointerData.isClicked) {
		pointerData.isClicked = false;
	}

	wheelActive = false;
	raw.prevTime = now;
}

function getClientCoords(e: MouseEvent | TouchEvent): [number, number] | null {
	if ('touches' in e) {
		if (e.touches.length === 0) return null;
		return [e.touches[0].clientX, e.touches[0].clientY];
	}
	const me = e as MouseEvent;
	if (me.clientX === undefined) return null;
	return [me.clientX, me.clientY];
}

function hardReset() {
	raw.pendingDx = 0;
	raw.pendingDy = 0;
	raw.smoothVx = 0;
	raw.smoothVy = 0;
	pointerData.dx = 0;
	pointerData.dy = 0;
	pointerData.vx = 0;
	pointerData.vy = 0;
}

export function initPointer() {
	if (typeof window === 'undefined' || pointerData.isInitialized) return;

	pointerData.x = window.innerWidth / 2;
	pointerData.y = window.innerHeight / 2;

	gsap.registerPlugin(Observer);

	raw.prevTime = performance.now();

	rafId = requestAnimationFrame(tick);

	pointerData.instance = Observer.create({
		target: window,
		type: 'pointer,touch,mouse,wheel',

		onChange: (self) => {
			const e = self.event;
			if (!e || (e.type !== 'wheel' && e.type !== 'mousewheel')) return;

			raw.pendingDx -= self.deltaX;
			raw.pendingDy -= self.deltaY;

			wheelActive = true;

			clearTimeout(wheelResetId);
			wheelResetId = window.setTimeout(() => {
				wheelActive = false;
				hardReset();
			}, 150);
		},

		onPress: (self) => {
			const e = self.event as MouseEvent | TouchEvent;
			if (!e || e.type === 'wheel') return;

			const coords = getClientCoords(e);
			if (!coords) return;
			const [cx, cy] = coords;

			pointerData.isDown = true;
			pointerData.x = cx;
			pointerData.y = cy;

			raw.prevX = cx;
			raw.prevY = cy;

			hardReset();
		},

		onMove: (self) => {
			const e = self.event as MouseEvent | TouchEvent;
			if (!e || e.type === 'wheel') return;

			const coords = getClientCoords(e);
			if (!coords) return;
			const [cx, cy] = coords;

			pointerData.x = cx;
			pointerData.y = cy;

			if (!pointerData.isDown) return;

			raw.pendingDx += cx - raw.prevX;
			raw.pendingDy += cy - raw.prevY;
			raw.prevX = cx;
			raw.prevY = cy;
		},

		onRelease: () => {
			pointerData.isDown = false;
			hardReset();
		},

		onClick: () => {
			pointerData.isClicked = true;
			pointerData.isDown = false;
		}
	});

	pointerData.isInitialized = true;
	return () => {
		cancelAnimationFrame(rafId);
		clearTimeout(wheelResetId);
		pointerData.instance?.kill();
		pointerData.isInitialized = false;
	};
}
