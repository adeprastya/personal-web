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
		nearDistance: number;
		farDistance: number;
		plateauWidth: number;
		revealSmoothing?: number;
		updateThrottleMs?: number;
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

	const { camera } = useThrelte();
	let group = $state<Group | undefined>(undefined);
	let displayText = $state('');

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
	const createBracketGeometry = (side: -1 | 1) => {
		const offset = maxWidth / 12;
		const x = (maxWidth / 2) * side;
		const o = offset * side;

		return new BufferGeometry().setFromPoints([
			new Vector3(x, -height / 2, 0),
			new Vector3(x + o, -height / 2, 0),
			new Vector3(x + o, height / 2, 0),
			new Vector3(x, height / 2, 0)
		]);
	};
	const bracketL = $derived(createBracketGeometry(-1));
	const bracketR = $derived(createBracketGeometry(1));

	// Text typing animation based on camera distance
	const worldPos = new Vector3();
	let smoothedProgress = 0;
	let lastCharCount = -1;
	let timeSinceLastUpdate = 0;
	useTask((delta) => {
		const cam = camera.current;
		if (!group || !cam || !visible) return;

		group.getWorldPosition(worldPos);
		const distance = worldPos.distanceTo(cam.position);

		const plateauEnd = MathUtils.clamp(nearDistance + plateauWidth, nearDistance, farDistance);
		const rawProgress = 1 - MathUtils.smoothstep(distance, plateauEnd, farDistance);

		bracketMat.opacity = rawProgress;
		textMat.opacity = rawProgress + 0.1;

		if (revealSmoothing > 0) {
			const t = 1 - Math.exp(-delta / revealSmoothing);
			smoothedProgress = MathUtils.lerp(smoothedProgress, rawProgress, t);
		} else {
			smoothedProgress = rawProgress;
		}

		timeSinceLastUpdate += delta * 1000;
		if (timeSinceLastUpdate < updateThrottleMs) return;
		timeSinceLastUpdate = 0;

		const charCount = Math.round(smoothedProgress * text.length);
		if (charCount !== lastCharCount) {
			lastCharCount = charCount;
			displayText = text.slice(0, charCount);
		}
	});
</script>

<T.Group bind:ref={group} {position} {visible}>
	<Billboard>
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
