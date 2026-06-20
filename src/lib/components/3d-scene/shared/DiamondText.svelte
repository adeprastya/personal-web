<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		Vector3,
		BufferGeometry,
		LineBasicMaterial,
		MeshBasicMaterial,
		Group,
		FrontSide
	} from 'three';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import gsap from 'gsap';

	interface Props {
		title?: string;
		description?: string;
		textWidth?: number;
		fontSize?: number;
		textPosition?: [number, number, number];
		textColor?: string;
		textIsVisible?: boolean;
	}
	let {
		title = 'Title Text',
		description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		textWidth = 1.5,
		fontSize = 0.1,
		textPosition = [0, 0, 0],
		textColor = '#ffffff',
		textIsVisible = true
	}: Props = $props();

	const { camera } = useThrelte();

	let textGroup = $state.raw<Group | undefined>(undefined);
	let lineMat = $state.raw<LineBasicMaterial | undefined>(undefined);
	const titleMat = new MeshBasicMaterial({
		color: (() => textColor)(),
		side: FrontSide,
		transparent: true,
		fog: false,
		opacity: (() => textIsVisible)() ? 1 : 0
	});
	const descMat = new MeshBasicMaterial({
		color: (() => textColor)(),
		side: FrontSide,
		transparent: true,
		fog: false,
		opacity: (() => textIsVisible)() ? 1 : 0
	});
	const lineGeometry = $derived.by(() => {
		const geo = new BufferGeometry().setFromPoints([
			new Vector3(-textWidth / 2, 0, 0),
			new Vector3(textWidth / 2, 0, 0)
		]);
		return geo;
	});

	$effect(() => {
		const targets = [titleMat, descMat, lineMat].filter(Boolean);
		if (textIsVisible) {
			gsap.to(targets, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 });
		} else {
			gsap.to(targets, { opacity: 0, duration: 0.5, ease: 'power2.in' });
		}
	});

	$effect(() => {
		if (!lineMat) return;
		lineMat.transparent = true;
		lineMat.opacity = textIsVisible ? 1 : 0;
	});

	useTask(() => {
		if (textGroup && camera.current) {
			textGroup.quaternion.copy(camera.current.quaternion);
		}
	});

	onDestroy(() => {
		titleMat.dispose();
		descMat.dispose();
		lineMat?.dispose();
		lineGeometry.dispose();
	});
</script>

<T.Group bind:ref={textGroup} position={textPosition}>
	<Text
		position={[-textWidth / 2, 0.4, 0]}
		maxWidth={textWidth}
		text={title.toLowerCase()}
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
		text={description.toUpperCase()}
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
</T.Group>
