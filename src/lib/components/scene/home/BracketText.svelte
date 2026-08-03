<script lang="ts">
	import {
		Vector3,
		BufferGeometry,
		LineBasicMaterial,
		MeshBasicMaterial,
		Group,
		FrontSide,
		MathUtils,
		Color
	} from 'three';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { Text, Billboard } from '@threlte/extras';

	interface Props {
		text?: string;
		fontSize?: number;
		maxWidth?: number;
		height?: number;
		color?: Color;
		position?: [number, number, number];
		visible?: boolean; 
		nearDistance: number; // Distance from camera at which reveal begins (fully hidden beyond this).
		farDistance: number; // Distance from camera at which reveal is fully complete.
		plateauWidth: number; // Distance range, starting at `nearDistance`, over which reveal stays at 0 before ramping up.
		revealSmoothing?: number; // Exponential smoothing time constant (seconds) applied to reveal progress. (0 = no smoothing).
		updateThrottleMs?: number; // Minimum interval (ms) between typewriter/opacity updates, used to throttle re-renders.
	}
	let {
		text = 'HELLO WORLD',
		fontSize = 0.05,
		maxWidth = 1.0,
		height = 0.3,
		color = new Color('#fff'),
		position = [0, 0, 0],
		visible = true,
		nearDistance,
		farDistance,
		plateauWidth,
		revealSmoothing = 0.15,
		updateThrottleMs = 40
	}: Props = $props();

	/** Opacity range mapped from raw (unsmoothed) reveal progress. */
	const opacityRange = { min: 0.1, max: 0.75 };

	// =====================================
	// Refs & materials
	// =====================================

	const { camera } = useThrelte();
	let group = $state<Group | undefined>(undefined);
	let displayText = $state('');

	// Materials are created once and mutated in place (color/opacity) rather
	// than recreated, since Three.js materials are relatively expensive to construct.
	const textMat = new MeshBasicMaterial({
		color: (() => color)(),
		side: FrontSide,
		transparent: true,
		fog: false,
		depthWrite: false
	});
	const bracketMat = new LineBasicMaterial({
		color: (() => color)(),
		side: FrontSide,
		transparent: true,
		fog: false,
		depthWrite: false
	});

	// Keep material colors in sync with the `color` prop.
	$effect(function syncMaterialColors() {
		textMat.color.copy(color);
		bracketMat.color.copy(color);
	});

	$effect(function cleanupMaterials() {
		return () => {
			textMat.dispose();
			bracketMat.dispose();
		};
	});

	// =====================================
	// Bracket geometry
	// =====================================

	function createBracketGeometry(side: -1 | 1): BufferGeometry {
		const offset = maxWidth / 12;
		const x = (maxWidth / 2) * side;
		const o = offset * side;

		return new BufferGeometry().setFromPoints([
			new Vector3(x, -height / 2, 0),
			new Vector3(x + o, -height / 2, 0),
			new Vector3(x + o, height / 2, 0),
			new Vector3(x, height / 2, 0)
		]);
	}

	const bracketL = $derived(createBracketGeometry(-1));
	const bracketR = $derived(createBracketGeometry(1));

	$effect(function syncCleanBracketGeo() {
		const left = bracketL;
		const right = bracketR;
		return () => {
			left.dispose();
			right.dispose();
		};
	});

	// =====================================
	// Distance-based reveal animation
	// =====================================

	const worldPos = new Vector3();

	let smoothedProgress = 0;
	let lastCharCount = -1;
	let timeSinceLastUpdate = 0;

	/** Distance from the group's world position to the camera. */
	function getCameraDistance(target: Group, camPosition: Vector3): number {
		target.getWorldPosition(worldPos);
		return worldPos.distanceTo(camPosition);
	}

	/**
	 * Maps camera distance to a raw [0, 1] reveal progress: fully hidden at
	 * `nearDistance` through the plateau, then smoothly ramping to fully
	 * revealed at `farDistance`.
	 */
	function computeRawProgress(distance: number): number {
		const plateauEnd = MathUtils.clamp(nearDistance + plateauWidth, nearDistance, farDistance);
		return 1 - MathUtils.smoothstep(distance, plateauEnd, farDistance);
	}

	/** Exponentially smooths progress toward `rawProgress`. Frame-rate independent. */
	function updateSmoothedProgress(rawProgress: number, delta: number) {
		if (revealSmoothing > 0) {
			const t = 1 - Math.exp(-delta / revealSmoothing);
			smoothedProgress = MathUtils.lerp(smoothedProgress, rawProgress, t);
		} else {
			smoothedProgress = rawProgress;
		}
	}

	/**
	 * Reveals `text` character-by-character in proportion to `smoothedProgress`.
	 * Only updates state (and triggers re-render) when the visible character
	 * count actually changes.
	 */
	function updateTypewriter() {
		const charCount = Math.round(smoothedProgress * text.length);
		if (charCount !== lastCharCount) {
			lastCharCount = charCount;
			displayText = text.slice(0, charCount);
		}
	}

	/** Fades brackets and text based on raw (unsmoothed) progress. */
	function updateOpacity(rawProgress: number) {
		const opacity = MathUtils.mapLinear(rawProgress, 0, 1, opacityRange.min, opacityRange.max);
		bracketMat.opacity = opacity;
		textMat.opacity = opacity;
	}

	useTask(function animateTextOpacity(delta) {
		const cam = camera.current;
		if (!group || !cam || !visible) return;

		const distance = getCameraDistance(group, cam.position);
		const rawProgress = computeRawProgress(distance);
		updateSmoothedProgress(rawProgress, delta);

		// Throttle typewriter/opacity updates independently of the render/task
		// rate, since character-level text updates are relatively expensive.
		timeSinceLastUpdate += delta * 1000;
		if (timeSinceLastUpdate < updateThrottleMs) return;
		timeSinceLastUpdate = 0;

		updateTypewriter();
		updateOpacity(rawProgress);
	});
</script>

<T.Group bind:ref={group} {position} {visible}>
	<Billboard>
		<!-- Brackets -->
		<T.Line geometry={bracketL} material={bracketMat} />
		<T.Line geometry={bracketR} material={bracketMat} />

		<Text
			text={displayText}
			{color}
			font="/fonts/Reddit_Mono/RedditMono-VariableFont_wght.ttf"
			{fontSize}
			{maxWidth}
			anchorX="center"
			anchorY="middle"
			textAlign="center"
			material={textMat}
		/>
	</Billboard>
</T.Group>
