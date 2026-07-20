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

	interface Props {
		diamondPosition?: [number, number, number];
		diamondColor?: string;
		title?: string;
		description?: string;
		textWidth?: number;
		fontSize?: number;
		textPosition?: [number, number, number];
		textColor?: string;
		progress?: number;
		revealSmoothing?: number;
		updateThrottleMs?: number;
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

	const { camera } = useThrelte();
	let displayTitle = $state<string>('');
	let displayDesc = $state<string>('');

	let textGroup = $state.raw<Group | undefined>(undefined);
	let lineMat = $state.raw<LineBasicMaterial | undefined>(undefined);
	const titleMat = new MeshBasicMaterial({
		color: (() => textColor)(),
		side: FrontSide,
		transparent: true,
		fog: false,
	});
	const descMat = new MeshBasicMaterial({
		color: (() => textColor)(),
		side: FrontSide,
		transparent: true,
		fog: false,
	});
	const lineGeometry = $derived.by(() => {
		const geo = new BufferGeometry().setFromPoints([
			new Vector3(-textWidth / 2, 0, 0),
			new Vector3(textWidth / 2, 0, 0)
		]);
		return geo;
	});

	let diamondGroup: Group | undefined = $state(undefined);
	let diamondMat = new MeshBasicMaterial({
		color: (() => diamondColor)(),
		side: DoubleSide,
		transparent: true,
		fog: false,
		depthWrite: false
	})

	function trapezoid(t: number, a = 0.4, b = 0.6, min = 0, max = 0.75 ) {
		t = MathUtils.clamp(t, 0, 1);
		if (t < a) return MathUtils.lerp(min, max, t / a);
		if (t <= b) return max;
		return MathUtils.lerp(max, min, (t - b) / (1 - b));
	}
	// Text typing animation based on progress
	let smoothedProgress = 0;
	let lastTitleCount = -1;
	let lastDescCount = -1;
	let timeSinceLastUpdate = 0;
	useTask((delta) => {
		const cam = camera.current;
		if (!cam || !titleMat || !descMat || !lineMat || !diamondMat || !diamondGroup) return;

		if (revealSmoothing > 0) {
			const t = 1 - Math.exp(-delta / revealSmoothing);
			smoothedProgress = MathUtils.lerp(
				smoothedProgress,
				trapezoid(progress, 0.4, 0.6, 0, 1),
				t
			);
		} else {
			smoothedProgress = progress;
		}

		timeSinceLastUpdate += delta * 1000;
		if (timeSinceLastUpdate < updateThrottleMs) return;
		timeSinceLastUpdate = 0;

		// Typing animation
		const titleCount = Math.round(smoothedProgress * title.length);
		if (titleCount !== lastTitleCount) {
			lastTitleCount = titleCount;
			displayTitle = title.slice(0, titleCount);
		}
		const charCount = Math.round(smoothedProgress * description.length);
		if (charCount !== lastDescCount) {
			lastDescCount = charCount;
			displayDesc = description.slice(0, charCount);
		}

		// Opacity animation
		lineMat.opacity = smoothedProgress;
		titleMat.opacity = smoothedProgress;
		descMat.opacity = smoothedProgress;

		// Diamond animation
		diamondMat.opacity = smoothedProgress;

		diamondGroup.rotation.y += delta * 3;
	});
</script>

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

<T.Group 
	bind:ref={diamondGroup}
	position={diamondPosition}
>
	<Float>
		<T.Mesh
			geometry={new OctahedronGeometry(0.05)}
		>
			<T.MeshBasicMaterial
				color={(() => diamondColor)()}
				wireframe
				opacity={0.1}
				transparent
			/>
		</T.Mesh>

		<T.Mesh
			geometry={new OctahedronGeometry(0.06)}
			material={diamondMat}
		>
		</T.Mesh>
	</Float>
</T.Group>
