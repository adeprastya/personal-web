<script lang="ts">
	import {
		HalfFloatType,
		DoubleSide,
		ShaderMaterial,
		Vector2,
		Shape,
		ShapeGeometry,
		EdgesGeometry,
		TextureLoader,
		ClampToEdgeWrapping,
		InstancedMesh,
		InstancedBufferAttribute,
		Matrix4
	} from 'three';
	import type { Texture } from 'three';
	import gsap from 'gsap';
	import { T, useThrelte, useTask } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';

	import { deviceData } from '$lib/contexts/device.svelte';
	import { AppRoute } from '$lib/types/Route';
	import { projectStore } from '$lib/stores/projects.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import {
		setActiveProject,
		setVisibility,
		activeProjectData
	} from '$lib/contexts/activeProject.svelte';
	import { dragProgress } from '$lib/contexts/dragProgress.svelte';
	import { DimensionalEffect } from '$lib/effects/DimensionalEffect';

	const HEX = {
		radius: 0.06,
		gap: 0.008,
		hole: 0.0, // [0-1]
		cols: 40,
		rows: 25
	};
	const WAVE = {
		power: 0.5,
		speed: 1.5,
		freq: 4.0
	};
	const BLEND_ZONE = 0.4; // [0-0.5] 0.5 almost no static
	const GROUP_Y = 5; // group postition

	// ---------------------------------------------------------------------------
	// State
	// ---------------------------------------------------------------------------
	const { renderer, scene, camera, renderStage } = useThrelte();

	let progress = $derived(dragProgress.works);
	let isOnWorks = $derived(routeData.current === AppRoute.works);
	let totalProjects = $derived(projectStore.projects.length);
	let currentIndex = $state(0);
	let isHovered = $state(false);

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
	const hexGeo = new ShapeGeometry(buildHexShape(HEX.radius - HEX.gap));
	const edgesGeo = new EdgesGeometry(hexGeo);

	// ---------------------------------------------------------------------------
	// Grid
	// ---------------------------------------------------------------------------
	interface HexCell {
		cx: number;
		cy: number;
	}
	function buildGrid(): HexCell[] {
		const r = HEX.radius - HEX.gap / 2;
		const dx = r * Math.sqrt(3);
		const dy = r * 1.5;
		const offsetX = (HEX.cols * dx) / 2 - dx / 2;
		const offsetY = (HEX.rows * dy) / 2 - dy / 2;
		const cells: HexCell[] = [];
		for (let row = 0; row < HEX.rows; row++) {
			for (let col = 0; col < HEX.cols; col++) {
				if (Math.random() < HEX.hole) continue;
				cells.push({
					cx: col * dx + (row % 2 === 0 ? 0 : dx / 2) - offsetX,
					cy: row * dy - offsetY
				});
			}
		}
		return cells;
	}

	const cells = buildGrid();
	const COUNT = cells.length;
	const gridBounds = (() => {
		const xs = cells.map((c) => c.cx);
		const ys = cells.map((c) => c.cy);
		return {
			minX: Math.min(...xs) - HEX.radius,
			maxX: Math.max(...xs) + HEX.radius,
			minY: Math.min(...ys) - HEX.radius,
			maxY: Math.max(...ys) + HEX.radius
		};
	})();

	// ---------------------------------------------------------------------------
	// Instanced buffer
	// ---------------------------------------------------------------------------
	const instanceData = new Float32Array(COUNT * 2);
	for (let i = 0; i < COUNT; i++) {
		instanceData[i * 2 + 0] = 1;
		instanceData[i * 2 + 1] = Math.random();
	}

	const instanceAttr = new InstancedBufferAttribute(instanceData, 2);
	const edgeInstanceAttr = new InstancedBufferAttribute(instanceData, 2);
	hexGeo.setAttribute('aInstanceData', instanceAttr);
	edgesGeo.setAttribute('aInstanceData', edgeInstanceAttr);

	// ---------------------------------------------------------------------------
	// Textures
	// ---------------------------------------------------------------------------
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const textureCache = new Map<string, Texture>();
	const loader = new TextureLoader();
	let isTexturesLoaded = $state(false);

	async function preloadTexture(url: string): Promise<Texture> {
		if (textureCache.has(url)) return textureCache.get(url)!;

		const tex = await loader.loadAsync(url);
		tex.wrapS = tex.wrapT = ClampToEdgeWrapping;

		if (renderer) renderer.initTexture(tex);

		textureCache.set(url, tex);
		return tex;
	}
	$effect(() => {
		if (totalProjects === 0 || isTexturesLoaded) return;

		const loadAll = async () => {
			const promises = projectStore.projects.map((project) => {
				const url = project?.image_thumbnail_url;
				return url ? preloadTexture(url) : Promise.resolve(null);
			});

			try {
				await Promise.all(promises);
				isTexturesLoaded = true;
			} catch (error) {
				console.error('Failed to preload works project textures:', error);
			}
		};

		loadAll();
	});

	function getProjectTexture(index: number): Texture | null {
		if (index < 0 || index >= totalProjects) return null;
		const url = projectStore.projects[index]?.image_thumbnail_url;
		return url ? (textureCache.get(url) ?? null) : null;
	}

	// ---------------------------------------------------------------------------
	// Shaders
	// ---------------------------------------------------------------------------

	const vertexShaderImg = /* glsl */ `
		attribute vec2 aInstanceData;
		varying vec2  vWorldUV;
		varying float vBlend;
		varying float vThreshold;
		uniform vec2  gridMin;
		uniform vec2  gridSize;
		uniform vec2  groupOffset;
		uniform float uWavePower;
		uniform float uWaveSpeed;
		uniform float uWaveFreq;
		uniform float uTime;

		mat4 rotationX(float angle) {
			float s = sin(angle);
			float c = cos(angle);
			return mat4(
				1.0, 0.0, 0.0, 0.0,
				0.0, c,   s,   0.0,
				0.0, -s,  c,   0.0,
				0.0, 0.0, 0.0, 1.0
			);
		}
		mat4 rotationY(float angle) {
			float s = sin(angle);
			float c = cos(angle);
			return mat4(
				c,   0.0, -s,  0.0,
				0.0, 1.0, 0.0, 0.0,
				s,   0.0, c,   0.0,
				0.0, 0.0, 0.0, 1.0
			);
		}

		void main() {
			vBlend     = aInstanceData.x;
			vThreshold = aInstanceData.y;

			vec4 localPos = vec4(position, 1.0);

			vec4 instanceCenter = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
			float dist = length(instanceCenter.xy);

			float wave = sin(dist * uWaveFreq - uTime * uWaveSpeed) * uWavePower;

			mat4 rotMat = rotationX(wave) * rotationY(wave);
			vec4 rotatedLocalPos = rotMat * localPos;

			vec4 worldPos = modelMatrix * instanceMatrix * rotatedLocalPos;

			vWorldUV    = (worldPos.xy - groupOffset - gridMin) / gridSize;
			gl_Position = projectionMatrix * viewMatrix * worldPos;
		}
	`;
	const fragmentShaderImg = /* glsl */ `
		uniform sampler2D mapA;
		uniform sampler2D mapB;
		uniform int hasMapA;
		uniform int hasMapB;
		varying vec2 vWorldUV;
		varying float vBlend;
		varying float vThreshold;

		void main() {
			float t = step(vThreshold, vBlend);

			vec4 colA = hasMapA == 1 ? texture2D(mapA, vWorldUV) : vec4(0.0);
			vec4 colB = hasMapB == 1 ? texture2D(mapB, vWorldUV) : vec4(0.0);

			vec4 col = mix(colA, colB, t);

			if (col.a < 0.01) discard;
      gl_FragColor = vec4(col.rgb, col.a * 0.5);
		}
	`;
	const vertexShaderEdge = /* glsl */ `
		attribute vec2 aInstanceData;
		varying float  vBlend;
		varying float  vThreshold;
		uniform float  uWavePower;
		uniform float  uWaveSpeed;
		uniform float  uWaveFreq;
		uniform float  uTime;

		mat4 rotationX(float angle) {
			float s = sin(angle);
			float c = cos(angle);
			return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, s, 0.0, 0.0, -s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
		}
		mat4 rotationY(float angle) {
			float s = sin(angle);
			float c = cos(angle);
			return mat4(c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
		}

		void main() {
			vBlend     = aInstanceData.x;
			vThreshold = aInstanceData.y;

			vec4 localPos = vec4(position, 1.0);

			vec4 instanceCenter = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
			float dist = length(instanceCenter.xy);

			float wave = sin(dist * uWaveFreq - uTime * uWaveSpeed) * uWavePower;

			mat4 rotMat = rotationX(wave) * rotationY(wave);

			gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * rotMat * localPos;
		}
	`;
	const fragmentShaderEdge = /* glsl */ `
		varying float vBlend;
		varying float vThreshold;

		void main() {
			float t  = step(vThreshold, vBlend);
			float op = mix(0.08, 0.18, t);
			gl_FragColor = vec4(1.0, 1.0, 1.0, op);
		}
	`;

	// ---------------------------------------------------------------------------
	// Materials
	// ---------------------------------------------------------------------------
	const gridMin = new Vector2(gridBounds.minX, gridBounds.minY);
	const gridSize = new Vector2(
		gridBounds.maxX - gridBounds.minX,
		gridBounds.maxY - gridBounds.minY
	);
	const groupOffset = new Vector2(0, GROUP_Y);

	const imgMaterial = new ShaderMaterial({
		uniforms: {
			mapA: { value: null },
			mapB: { value: null },
			hasMapA: { value: 0 },
			hasMapB: { value: 0 },
			gridMin: { value: gridMin },
			gridSize: { value: gridSize },
			groupOffset: { value: groupOffset },
			uWavePower: { value: WAVE.power },
			uWaveSpeed: { value: WAVE.speed },
			uWaveFreq: { value: WAVE.freq },
			uTime: { value: 0 }
		},
		vertexShader: vertexShaderImg,
		fragmentShader: fragmentShaderImg,
		transparent: true,
		side: DoubleSide
	});
	const edgeMaterial = new ShaderMaterial({
		uniforms: {
			uWavePower: { value: WAVE.power },
			uWaveSpeed: { value: WAVE.speed },
			uWaveFreq: { value: WAVE.freq },
			uTime: { value: 0 }
		},
		vertexShader: vertexShaderEdge,
		fragmentShader: fragmentShaderEdge,
		transparent: true
	});

	// ---------------------------------------------------------------------------
	// InstancedMesh
	// ---------------------------------------------------------------------------
	let imgMesh: InstancedMesh | null = $state(null);
	let edgeMesh: InstancedMesh | null = $state(null);

	$effect(() => {
		const mesh = new InstancedMesh(hexGeo, imgMaterial, COUNT);
		const edges = new InstancedMesh(edgesGeo, edgeMaterial, COUNT);
		mesh.frustumCulled = false;
		edges.frustumCulled = false;

		const mat4 = new Matrix4();
		cells.forEach((cell, i) => {
			mat4.setPosition(cell.cx, cell.cy, 0);
			mesh.setMatrixAt(i, mat4);
			mat4.setPosition(cell.cx, cell.cy, 0.001);
			edges.setMatrixAt(i, mat4);
		});
		mesh.instanceMatrix.needsUpdate = true;
		edges.instanceMatrix.needsUpdate = true;
		mesh.computeBoundingSphere();
		edges.computeBoundingSphere();

		imgMesh = mesh;
		edgeMesh = edges;

		return () => {
			mesh.dispose();
			edges.dispose();
			imgMesh = null;
			edgeMesh = null;
		};
	});

	// ---------------------------------------------------------------------------
	// Scene update
	// ---------------------------------------------------------------------------
	let lastFrom = -1;
	let lastTo = -1;

	function setBlend(fromIdx: number, toIdx: number, blend: number) {
		if (fromIdx !== lastFrom || toIdx !== lastTo) {
			const texA = getProjectTexture(fromIdx);
			const texB = getProjectTexture(toIdx);
			imgMaterial.uniforms.mapA.value = texA;
			imgMaterial.uniforms.mapB.value = texB;
			imgMaterial.uniforms.hasMapA.value = texA ? 1 : 0;
			imgMaterial.uniforms.hasMapB.value = texB ? 1 : 0;
			lastFrom = fromIdx;
			lastTo = toIdx;
		}

		for (let i = 0; i < COUNT; i++) {
			instanceData[i * 2 + 0] = blend;
		}
		instanceAttr.needsUpdate = true;
		edgeInstanceAttr.needsUpdate = true;
	}

	$effect(() => {
		if (!isOnWorks || totalProjects === 0) return;

		const rawIndex = progress * totalProjects;
		const cur = Math.min(Math.floor(rawIndex), totalProjects - 1);
		const localProgress = Math.max(0, Math.min(1, rawIndex - cur));

		if (cur !== currentIndex) currentIndex = cur;

		const prev = cur === 0 ? -1 : cur - 1;
		const next = cur === totalProjects - 1 ? totalProjects : cur + 1;

		if (localProgress < BLEND_ZONE) {
			const blend = 0.5 + (localProgress / BLEND_ZONE) * 0.5;
			setBlend(prev, cur, blend);
		} else if (localProgress > 1 - BLEND_ZONE) {
			const blend = ((localProgress - (1 - BLEND_ZONE)) / BLEND_ZONE) * 0.5;
			setBlend(cur, next, blend);
		} else {
			setBlend(cur, cur, 1);
		}
	});

	// ---------------------------------------------------------------------------
	// Post-processing
	// ---------------------------------------------------------------------------
	const invertEffect = new DimensionalEffect({ progress: 0, time: 0 });
	let composer: EffectComposer | null = null;

	$effect(() => {
		const cam = camera.current;
		if (!cam) return;

		composer?.dispose();
		composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType });

		composer.setSize(window.innerWidth, window.innerHeight);
		composer.addPass(new RenderPass(scene, cam));
		composer.addPass(new EffectPass(cam, invertEffect));
		return () => {
			composer?.dispose();
			composer = null;
		};
	});

	$effect(() => {
		gsap.to(invertEffect, {
			progress: activeProjectData.isVisible ? 1 : 0,
			duration: 1.2,
			ease: 'circ.inOut'
		});
	});

	useTask(
		(delta) => {
			imgMaterial.uniforms.uTime.value += delta;
			edgeMaterial.uniforms.uTime.value += delta;
			composer?.render(delta);
		},
		{ stage: renderStage, autoInvalidate: true }
	);

	// ---------------------------------------------------------------------------
	// Cleanup
	// ---------------------------------------------------------------------------
	$effect(() => () => {
		hexGeo.dispose();
		edgesGeo.dispose();
		imgMaterial.dispose();
		edgeMaterial.dispose();
		imgMesh?.dispose();
		edgeMesh?.dispose();
		textureCache.forEach((t) => t.dispose());
		textureCache.clear();
	});

	// ---------------------------------------------------------------------------
	// Interaction
	// ---------------------------------------------------------------------------
	$effect(() => {
		document.body.style.cursor = isHovered ? 'pointer' : 'default';
	});
	function handleClick() {
		const project = projectStore.projects[currentIndex];
		if (!project) return;
		setActiveProject(currentIndex, project);
		setVisibility(true);
	}
</script>

{#if imgMesh && edgeMesh}
	<T.Group
		position={[0, GROUP_Y, 0]}
		onclick={handleClick}
		onpointerenter={() => (isHovered = true)}
		onpointerleave={() => (isHovered = false)}
	>
		<T is={imgMesh} />
		<T is={edgeMesh} />
		<Text
			text={projectStore.projects[currentIndex]?.title ?? ''}
			position={[0, 0, 0.05]}
			font="/fonts/Canterbury/Canterbury.ttf"
			fontSize={deviceData.isMobile ? 0.14 : 0.2}
			anchorX="center"
			anchorY="middle"
			color="#eeeeee"
			fillOpacity={1}
		/>
	</T.Group>
{/if}
