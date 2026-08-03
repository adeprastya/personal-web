<script lang="ts">
	import {
		Vector3,
		BufferGeometry,
		LineBasicMaterial,
		MeshBasicMaterial,
		Group,
		FrontSide,
		MathUtils,
		OctahedronGeometry,
		DoubleSide
	} from 'three';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { Billboard, Float, Text } from '@threlte/extras';
	import { trapezoid } from '$lib/utils/progressManipulation';

	interface Props {
		diamondPosition?: [number, number, number];
		diamondColor?: string;
		title?: string;
		description?: string;
		textWidth?: number;
		fontSize?: number;
		textPosition?: [number, number, number];
		textColor?: string;
		progress?: number; // Progress value in [0, 1] driving the reveal/typewriter animation.
		revealSmoothing?: number; // Progress exponential smoothing time constant (seconds). Set to 0 to disable smoothing.
		updateThrottleMs?: number; // Minimum interval (ms) between typewriter/opacity updates (throttle).
	}
	let {
		diamondPosition = [0, 0, 0],
		diamondColor = '#ffffff',
		title = 'Title Text',
		description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		textWidth = 1.5,
		fontSize = 0.1,
		textPosition = [0, 0, 0],
		textColor = '#ffffff',
		progress = 0,
		revealSmoothing = 0.15,
		updateThrottleMs = 40
	}: Props = $props();

	// =====================================
	// Configuration
	// =====================================

	// Shape of the trapezoidal reveal curve applied to raw `progress` before smoothing.
	const revealCurve = { riseStart: 0.4, riseEnd: 0.6, from: 0, to: 1 };
	const diamondSpinSpeed = 3; // Diamond rotation speed, in radians/second.

	const diamondOuterGeo = new OctahedronGeometry(0.05);
	const diamondInnerGeo = new OctahedronGeometry(0.06);

	// =====================================
	// Materials
	// =====================================

	const titleMat = new MeshBasicMaterial({
		color: (() => textColor)(),
		side: FrontSide,
		transparent: true,
		fog: false
	});
	const descMat = new MeshBasicMaterial({
		color: (() => textColor)(),
		side: FrontSide,
		transparent: true,
		fog: false
	});
	const diamondMat = new MeshBasicMaterial({
		color: (() => diamondColor)(),
		side: DoubleSide,
		transparent: true,
		fog: false,
		depthWrite: false
	});

	$effect(function syncTextMat() {
		titleMat.color.set(textColor);
		descMat.color.set(textColor);
	});
	$effect(function syncDiamondMat() {
		diamondMat.color.set(diamondColor);
	});

	$effect(function cleanupMats() {
		return () => {
			titleMat.dispose();
			descMat.dispose();
			diamondMat.dispose();
		};
	});

	// =====================================
	// Geometry
	// =====================================

	const lineGeometry = $derived.by(function createLineGeo() {
		return new BufferGeometry().setFromPoints([
			new Vector3(-textWidth / 2, 0, 0),
			new Vector3(textWidth / 2, 0, 0)
		]);
	});

	$effect(function syncLineGeo() {
		const geo = lineGeometry;
		return () => geo.dispose();
	});

	// =====================================
	// Refs
	// =====================================

	const { camera } = useThrelte();

	let textGroup = $state.raw<Group | undefined>(undefined);
	let lineMat = $state.raw<LineBasicMaterial | undefined>(undefined);
	let diamondGroup: Group | undefined = $state(undefined);

	// =====================================
	// Reveal / typewriter animation state
	// =====================================

	let displayTitle = $state<string>('');
	let displayDesc = $state<string>('');

	let smoothedProgress = 0;
	let lastTitleCount = -1;
	let lastDescCount = -1;
	let timeSinceLastUpdate = 0;

	/**
	 * Applies the reveal curve to `progress` and exponentially smooths it
	 * Frame-rate independent.
	 */
	function updateSmoothedProgress(delta: number) {
		const target = trapezoid(
			progress,
			revealCurve.riseStart,
			revealCurve.riseEnd,
			revealCurve.from,
			revealCurve.to
		);

		if (revealSmoothing > 0) {
			const t = 1 - Math.exp(-delta / revealSmoothing);
			smoothedProgress = MathUtils.lerp(smoothedProgress, target, t);
		} else {
			smoothedProgress = target;
		}
	}

	/**
	 * Reveals `title` and `description` character-by-character in proportion.
	 * Only updates state when the visible character count actually changes.
	 */
	function updateTypewriter() {
		const titleCount = Math.round(smoothedProgress * title.length);
		if (titleCount !== lastTitleCount) {
			lastTitleCount = titleCount;
			displayTitle = title.slice(0, titleCount);
		}

		const descCount = Math.round(smoothedProgress * description.length);
		if (descCount !== lastDescCount) {
			lastDescCount = descCount;
			displayDesc = description.slice(0, descCount);
		}
	}

	/** Fades in the underline, title, description, and diamond together. */
	function updateOpacity(line: LineBasicMaterial) {
		line.opacity = smoothedProgress;
		titleMat.opacity = smoothedProgress;
		descMat.opacity = smoothedProgress;
		diamondMat.opacity = smoothedProgress;
	}

	function updateDiamondSpin(group: Group, delta: number) {
		group.rotation.y += delta * diamondSpinSpeed;
	}

	useTask(function runAnimation(delta) {
		const cam = camera.current;
		if (!cam || !lineMat || !diamondGroup) return;

		updateSmoothedProgress(delta);

		// Throttle typewriter updates, because of their expensive.
		timeSinceLastUpdate += delta * 1000;
		if (timeSinceLastUpdate > updateThrottleMs) {
			timeSinceLastUpdate = 0;

			updateTypewriter();
			updateOpacity(lineMat);
			updateDiamondSpin(diamondGroup, delta);
		}
	});
</script>

<!-- Title + underline + description -->
<T.Group bind:ref={textGroup} position={textPosition}>
	<Billboard>
		<Text
			position={[-textWidth / 2, 0.4, 0]}
			maxWidth={textWidth}
			text={displayTitle.toLowerCase()}
			font="/fonts/Canterbury/Canterbury.ttf"
			{fontSize}
			lineHeight={1.05}
			letterSpacing={0.1}
			textAlign="justify"
			anchorX="left"
			anchorY="bottom"
			color={textColor}
			material={titleMat}
		/>

		<T.Line geometry={lineGeometry} position={[0, 0.35, 0]}>
			<T.LineBasicMaterial bind:ref={lineMat} color={textColor} transparent />
		</T.Line>

		<Text
			position={[-textWidth / 2, 0.3, 0]}
			maxWidth={textWidth}
			text={displayDesc.toUpperCase()}
			font="/fonts/Figtree/Figtree-VariableFont_wght.ttf"
			fontSize={fontSize * 0.4}
			lineHeight={1.05}
			letterSpacing={0.08}
			textAlign="justify"
			anchorX="left"
			anchorY="top"
			color={textColor}
			material={descMat}
		/>
	</Billboard>
</T.Group>

<!-- Floating spinning diamond marker -->
<T.Group bind:ref={diamondGroup} position={diamondPosition}>
	<Float>
		<T.Mesh geometry={diamondOuterGeo}>
			<T.MeshBasicMaterial color={diamondColor} wireframe opacity={0.1} transparent />
		</T.Mesh>

		<T.Mesh geometry={diamondInnerGeo} material={diamondMat} />
	</Float>
</T.Group>
