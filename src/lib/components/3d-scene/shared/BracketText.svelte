<script lang="ts">
	import {
		Vector3,
		BufferGeometry,
		BufferAttribute,
		Line,
		LineBasicMaterial,
		MeshBasicMaterial,
		Group,
		PerspectiveCamera,
		FrontSide,
		MathUtils
	} from 'three';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { onMount } from 'svelte';

	interface BracketTextProps {
		text?: string;
		fontSize?: number;
		width?: number;
		height?: number;
		color?: string;
		position?: [number, number, number];
		worldCenter?: [number, number, number];
		visible?: boolean;
	}
	let {
		text = 'HELLO WORLD',
		fontSize = 0.05,
		width = 1.0,
		height = 0.3,
		color = '#888888',
		position = [0, 0, 0],
		worldCenter = [0, 0, 0],
		visible = true
	}: BracketTextProps = $props();

	const { camera } = useThrelte();
	let group = $state<Group | undefined>(undefined);
	let centerLineRef = $state<Line | undefined>(undefined);

	const lineMat = new LineBasicMaterial({
		color: color,
		side: FrontSide,
		transparent: true,
		fog: false
	});
	const bracketMat = new LineBasicMaterial({
		color: color,
		side: FrontSide,
		transparent: true,
		fog: false
	});
	const textMat = new MeshBasicMaterial({ side: FrontSide, transparent: true });

	const bracketL = new BufferGeometry().setFromPoints([
		new Vector3(-width / 2, -height / 2, 0),
		new Vector3(-width / 2 - width / 12, -height / 2, 0),
		new Vector3(-width / 2 - width / 12, height / 2, 0),
		new Vector3(-width / 2, height / 2, 0)
	]);
	const bracketR = new BufferGeometry().setFromPoints([
		new Vector3(width / 2, -height / 2, 0),
		new Vector3(width / 2 + width / 12, -height / 2, 0),
		new Vector3(width / 2 + width / 12, height / 2, 0),
		new Vector3(width / 2, height / 2, 0)
	]);

	const temp = new Vector3();
	const positions = new Float32Array([0, 0, 0, 0, 0, 0]);
	const centerLine = new BufferGeometry();
	centerLine.setAttribute('position', new BufferAttribute(positions, 3));
	const worldPos = new Vector3();

	let camNear: number;
	let camFar: number;

	onMount(() => {
		camNear = (camera.current as PerspectiveCamera).near + 1.5;
		camFar = (camera.current as PerspectiveCamera).far - 5.0;
	});

	useTask(() => {
		if (!group || !camera.current || !visible) return;

		// Billboard effect
		const camPos = camera.current.position;
		group.lookAt(camPos.x, camPos.y, camPos.z);

		// Distance opacity effect
		group.getWorldPosition(worldPos);
		const distance = worldPos.distanceTo(camPos);
		const opacity = MathUtils.clamp(1 - (distance - camNear) / (camFar - camNear), 0, 1);
		textMat.opacity = opacity;
		bracketMat.opacity = opacity;
		lineMat.opacity = opacity * 0.7;

		// Straight Line
		if (!centerLineRef) return;
		temp.copy(new Vector3(...worldCenter));
		group.worldToLocal(temp);
		const positions = centerLineRef.geometry.attributes.position.array as Float32Array;
		positions[3] = temp.x;
		positions[4] = temp.y;
		positions[5] = temp.z;
		centerLineRef.geometry.attributes.position.needsUpdate = true;
	});
</script>

<T.Group bind:ref={group} {position} {visible}>
	<T.Line geometry={bracketL} material={bracketMat} />
	<T.Line geometry={bracketR} material={bracketMat} />
	<T.Line bind:ref={centerLineRef} geometry={centerLine} material={lineMat} />

	<Text
		{text}
		color="#eeeeee"
		font="/fonts/Reddit_Mono/RedditMono-VariableFont_wght.ttf"
		{fontSize}
		maxWidth={width}
		anchorX="center"
		anchorY="middle"
		textAlign="justify"
		material={textMat}
	/>
</T.Group>
