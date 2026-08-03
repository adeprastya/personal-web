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

	/** Generates the points of a flat circle of the given radius, in the XZ plane. */
	function createCirclePoints(radius: number, segments: number): Vector3[] {
		const points: Vector3[] = [];
		for (let i = 0; i <= segments; i++) {
			const theta = (i / segments) * Math.PI * 2;
			points.push(new Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
		}
		return points;
	}

	const geometry = $derived(new BufferGeometry().setFromPoints(createCirclePoints(radius, segments)));

	$effect(function syncCleanGeometry() {
		const geo = geometry;
		return () => geo.dispose();
	});

	const material = new LineBasicMaterial({ color: (() => color)(), transparent: true, side: FrontSide });

	$effect(function syncMaterial() {
		material.color.copy(color);
		material.opacity = opacity;
	});

	$effect(function cleanupMaterial() {
		return () => material.dispose();
	});
</script>

<T.LineLoop {geometry} {material} position={[0, y, 0]} rotation={[rotation, 0, 0]} />
