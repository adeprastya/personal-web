<script lang="ts">
	import { Vector3, BufferGeometry, LineBasicMaterial, FrontSide, Color } from 'three';
	import { T } from '@threlte/core';

	interface Props {
		radius?: number;
		segments?: number;
		y?: number;
		rotation?: number;
		color?: Color;
		opacity?: number;
	}
	let {
		radius = 1,
		segments = 64,
		color = new Color('#ffffff'),
		y = 0,
		rotation = 0,
		opacity = 1
	}: Props = $props();

	const points: Vector3[] = [];
	// svelte-ignore state_referenced_locally
	for (let i = 0; i <= segments; i++) {
		const theta = (i / segments) * Math.PI * 2;
		points.push(new Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
	}
	const geometry = new BufferGeometry().setFromPoints(points);

	// svelte-ignore state_referenced_locally
	const material = new LineBasicMaterial({ color, opacity, transparent: true, side: FrontSide });
</script>

<T.LineLoop {geometry} {material} position={[0, y, 0]} rotation={[rotation, 0, 0]} />
