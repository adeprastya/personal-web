<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		Vector3,
		BufferGeometry,
		LineBasicMaterial,
		MeshBasicMaterial,
		Mesh,
		Group,
		FrontSide
	} from 'three';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import gsap from 'gsap';

	interface DiamondTextProps {
		title?: string;
		description?: string;
		textWidth?: number;
		fontSize?: number;
		diamondPosition?: [number, number, number];
		diamondColor?: string;
		textPosition?: [number, number, number];
		textColor?: string;
		textIsVisible?: boolean;
	}

	let {
		title = 'Title Text',
		description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		textWidth = 1.5,
		fontSize = 0.1,
		diamondPosition = [0, 0, 0],
		diamondColor = '#ffffff',
		textPosition = [0, 0, 0],
		textColor = '#ffffff',
		textIsVisible = true
	}: DiamondTextProps = $props();

	const { camera } = useThrelte();

	let diamondMesh = $state.raw<Mesh | undefined>(undefined);
	let textGroup = $state.raw<Group | undefined>(undefined);
	let lineMat = $state.raw<LineBasicMaterial | undefined>(undefined);
	const titleMat = new MeshBasicMaterial({
		color: textColor,
		side: FrontSide,
		transparent: true,
		fog: false,
		opacity: textIsVisible ? 1 : 0
	});
	const descMat = new MeshBasicMaterial({
		color: textColor,
		side: FrontSide,
		transparent: true,
		fog: false,
		opacity: textIsVisible ? 1 : 0
	});
	const lineGeometry = new BufferGeometry().setFromPoints([
		new Vector3(-textWidth / 2, 0, 0),
		new Vector3(textWidth / 2, 0, 0)
	]);

	let floatTime = 0;

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

	useTask((delta) => {
		// Texts billboarding
		if (textGroup && camera.current) {
			textGroup.quaternion.copy(camera.current.quaternion);
		}

		// Diamond floating animation
		if (diamondMesh) {
			diamondMesh.rotation.x += delta * 0.5;
			diamondMesh.rotation.y += delta * 0.5;
			diamondMesh.rotation.z += delta * 0.5;
			floatTime += delta * 2.0;
			diamondMesh.position.y = diamondPosition[1] + Math.sin(floatTime) * 0.05;
		}
	});

	onDestroy(() => {
		lineGeometry.dispose();
		titleMat.dispose();
		descMat.dispose();
		lineMat?.dispose();
	});
</script>

<!-- Diamond -->
<T.Mesh bind:ref={diamondMesh} position={diamondPosition}>
	<T.TetrahedronGeometry args={[0.075, 0]} />
	<T.MeshLambertMaterial color={diamondColor} />
</T.Mesh>

<!-- Texts group -->
<T.Group bind:ref={textGroup} position={textPosition}>
	<!-- Title -->
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

	<!-- Separator -->
	<T.Line geometry={lineGeometry} position={[0, 0.35, 0]}>
		<T.LineBasicMaterial bind:ref={lineMat} color={textColor} transparent />
	</T.Line>

	<!-- Description -->
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
