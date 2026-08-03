<script lang="ts">
	import {
		type Texture,
		FrontSide,
		ShaderMaterial,
		Vector2,
		Shape,
		ShapeGeometry,
		InstancedMesh,
		InstancedBufferAttribute,
		Matrix4
	} from 'three';
	import { T, useThrelte, useTask } from '@threlte/core';
	import vert from '$lib/shaders/hexaWave/vert.glsl?raw';
	import frag from '$lib/shaders/hexaWave/frag.glsl?raw';

	const hex = {
		radius: 0.06,
		gap: 0.009,
		hole: 0.0, // [0-1]
		cols: 40,
		rows: 25
	};
	const wave = {
		power: 0.5,
		speed: 1.5,
		freq: 4.0,
		amplitude: 0.04
	};
	const blendZone = 0.4; // [0-0.5] 0.5 almost no static

	interface Props {
		progress: number /** progress 0-1 across the whole range */;
		totalItems: number /** total number of items being paged through */;
		getTexture: (
			index: number
		) => Texture | null /** returns the texture for a given item index (null while loading / out of range) */;
		currentIndex?: number /** currently visible index, bound back to the parent */;
	}
	let { progress, totalItems, getTexture, currentIndex = $bindable(0) }: Props = $props();

	const { renderStage } = useThrelte();

	// ---------------------------------------------------------------------------
	// Geometry
	// ---------------------------------------------------------------------------
	function buildHexShape(radius: number): Shape {
		const shape = new Shape();
		for (let i = 0; i < 6; i++) {
			const a = (Math.PI / 3) * i - Math.PI / 6;
			if (i === 0) shape.moveTo(radius * Math.cos(a), radius * Math.sin(a));
			else shape.lineTo(radius * Math.cos(a), radius * Math.sin(a));
		}
		shape.closePath();
		return shape;
	}
	const hexGeo = new ShapeGeometry(buildHexShape(hex.radius - hex.gap));

	// ---------------------------------------------------------------------------
	// Grid
	// ---------------------------------------------------------------------------
	interface HexCell {
		cx: number;
		cy: number;
	}
	function buildGrid(): HexCell[] {
		const r = hex.radius - hex.gap / 2;
		const dx = r * Math.sqrt(3);
		const dy = r * 1.5;
		const offsetX = (hex.cols * dx) / 2 - dx / 2;
		const offsetY = (hex.rows * dy) / 2 - dy / 2;
		const cells: HexCell[] = [];
		for (let row = 0; row < hex.rows; row++) {
			for (let col = 0; col < hex.cols; col++) {
				if (Math.random() < hex.hole) continue;
				cells.push({
					cx: col * dx + (row % 2 === 0 ? 0 : dx / 2) - offsetX,
					cy: row * dy - offsetY
				});
			}
		}
		return cells;
	}
	const cells = buildGrid();

	const count = cells.length;
	const gridBounds = (() => {
		const xs = cells.map((c) => c.cx);
		const ys = cells.map((c) => c.cy);
		return {
			minX: Math.min(...xs) - hex.radius,
			maxX: Math.max(...xs) + hex.radius,
			minY: Math.min(...ys) - hex.radius,
			maxY: Math.max(...ys) + hex.radius
		};
	})();

	// ---------------------------------------------------------------------------
	// Instanced buffer
	// ---------------------------------------------------------------------------
	const instanceData = new Float32Array(count * 2);
	// Initialize [blend, randomSeed]
	for (let i = 0; i < count; i++) {
		instanceData[i * 2 + 0] = 1;
		instanceData[i * 2 + 1] = Math.random();
	}

	const instanceAttr = new InstancedBufferAttribute(instanceData, 2);
	hexGeo.setAttribute('aInstanceData', instanceAttr);

	// ---------------------------------------------------------------------------
	// Materials
	// ---------------------------------------------------------------------------
	const gridMin = new Vector2(gridBounds.minX, gridBounds.minY);
	const gridSize = new Vector2(
		gridBounds.maxX - gridBounds.minX,
		gridBounds.maxY - gridBounds.minY
	);
	const groupOffset = new Vector2(0, 0);

	const imgMaterial = new ShaderMaterial({
		uniforms: {
			mapA: { value: null },
			mapB: { value: null },
			hasMapA: { value: 0 },
			hasMapB: { value: 0 },
			gridMin: { value: gridMin },
			gridSize: { value: gridSize },
			groupOffset: { value: groupOffset },
			uWavePower: { value: wave.power },
			uWaveAmplitude: { value: wave.amplitude },
			uWaveSpeed: { value: wave.speed },
			uWaveFreq: { value: wave.freq },
			uTime: { value: 0 }
		},
		vertexShader: vert,
		fragmentShader: frag,
		transparent: true,
		side: FrontSide
	});

	// ---------------------------------------------------------------------------
	// Instanced mesh
	// ---------------------------------------------------------------------------
	let imgMesh: InstancedMesh | null = $state(null);
	$effect(function updateInstancedMesh() {
		const mesh = new InstancedMesh(hexGeo, imgMaterial, count);
		mesh.frustumCulled = false;

		const mat4 = new Matrix4();
		cells.forEach((cell, i) => {
			mat4.setPosition(cell.cx, cell.cy, 0);
			mesh.setMatrixAt(i, mat4);
		});
		mesh.instanceMatrix.needsUpdate = true;
		mesh.computeBoundingSphere();

		imgMesh = mesh;

		return () => {
			mesh.dispose();
			imgMesh = null;
		};
	});

	// ---------------------------------------------------------------------------
	// Blend / paging logic
	// ---------------------------------------------------------------------------
	let lastFrom = -1;
	let lastTo = -1;

	function setBlend(fromIdx: number, toIdx: number, blend: number) {
		if (fromIdx !== lastFrom || toIdx !== lastTo) {
			const texA = getTexture(fromIdx);
			const texB = getTexture(toIdx);
			imgMaterial.uniforms.mapA.value = texA;
			imgMaterial.uniforms.mapB.value = texB;
			imgMaterial.uniforms.hasMapA.value = texA ? 1 : 0;
			imgMaterial.uniforms.hasMapB.value = texB ? 1 : 0;
			lastFrom = fromIdx;
			lastTo = toIdx;
		}

		for (let i = 0; i < count; i++) {
			instanceData[i * 2 + 0] = blend;
		}
		instanceAttr.needsUpdate = true;
	}

	$effect(function updateBlend() {
		if (totalItems === 0) return;

		const rawIndex = progress * totalItems;
		const cur = Math.min(Math.floor(rawIndex), totalItems - 1);
		const localProgress = Math.max(0, Math.min(1, rawIndex - cur));

		if (cur !== currentIndex) currentIndex = cur;

		const prev = cur === 0 ? -1 : cur - 1;
		const next = cur === totalItems - 1 ? totalItems : cur + 1;

		if (localProgress < blendZone) {
			const blend = 0.5 + (localProgress / blendZone) * 0.5;
			setBlend(prev, cur, blend);
		} else if (localProgress > 1 - blendZone) {
			const blend = ((localProgress - (1 - blendZone)) / blendZone) * 0.5;
			setBlend(cur, next, blend);
		} else {
			setBlend(cur, cur, 1);
		}
	});

	useTask(
		function animationLoop(delta) {
			imgMaterial.uniforms.uTime.value += delta;
		},
		{ stage: renderStage, autoInvalidate: true }
	);

	$effect(function cleanup() {
		return () => {
			hexGeo.dispose();
			imgMaterial.dispose();
			imgMesh?.dispose();
		};
	});
</script>

{#if imgMesh}
	<T is={imgMesh} />
{/if}
