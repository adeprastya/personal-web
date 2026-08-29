<script lang="ts">
	import { type Texture, TextureLoader, ClampToEdgeWrapping, Color } from 'three';
	import { T, useThrelte } from '@threlte/core';
	import { Text } from '@threlte/extras';

	import { device } from '$lib/state/device.svelte';
	import { AppRoute } from '$lib/types/AppRoute';
	import { route } from '$lib/state/route.svelte';
	import { drag } from '$lib/state/dragControl.svelte';
	import { projects } from '$lib/stores/projects.svelte';
	import { projectControl } from '$lib/state/projectControl.svelte';
	import HexaWavePlane from './HexaWavePlane.svelte';
	import CircleLine from '$lib/components/scene/shared/CircleLine.svelte';

	const { renderer } = useThrelte();

	const circColor = new Color('#fff');
	const circles = [
		{ radius: 2.6, segments: 64, color: circColor, opacity: 0.08 },
		{ radius: 3.0, segments: 64, color: circColor, opacity: 0.07 },
		{ radius: 3.4, segments: 64, color: circColor, opacity: 0.06 },
		{ radius: 3.8, segments: 64, color: circColor, opacity: 0.05 }
	];

	let isOnWorks = $derived(route.is(AppRoute.Works));
	let progress = $derived(drag.is(AppRoute.Works));
	let total = $derived(projects.data.length);
	let projectState = $state({
		currentIdx: 0,
		isHovered: false
	});

	let currentProject = $derived(projects.data[projectState.currentIdx]);

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

	function getProjectTexture(index: number): Texture | null {
		if (index < 0 || index >= total) return null;

		const url = projects.data[index]?.image_thumbnail_url;
		return url ? (textureCache.get(url) ?? null) : null;
	}

	$effect(function preloadProjectTextures() {
		if (total === 0 || isTexturesLoaded) return;

		const loadAll = async () => {
			const promises = projects.data.map((p) => {
				const url = p?.image_thumbnail_url;
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

	$effect(function syncVisibilityWithRoute() {
		if (!isOnWorks) projectControl.hide();
	});

	$effect(function updateCursorWhenHovered() {
		if (!isOnWorks) return;
		document.body.style.cursor = projectState.isHovered ? 'crosshair' : 'default';
	});

	$effect(function cleanupTexture() {
		return () => {
			textureCache.forEach((t) => t.dispose());
			textureCache.clear();
		};
	});

	function handleClick() {
		if (!isOnWorks || !currentProject) return;

		projectControl.set(projectState.currentIdx, currentProject);
		projectControl.show();
	}
</script>

<T.Group
	position={[0, 0, 0]}
	onclick={handleClick}
	onpointerenter={() => (projectState.isHovered = true)}
	onpointerleave={() => (projectState.isHovered = false)}
	visible={isOnWorks}
>
	{#each circles as setting, i (i)}
		<T.Group rotation.x={Math.PI / 2} position.z={-1}>
			<CircleLine {...setting} color={setting.color.clone()} y={0} />
		</T.Group>
	{/each}

	<HexaWavePlane
		{progress}
		totalItems={total}
		getTexture={getProjectTexture}
		bind:currentIndex={projectState.currentIdx}
	/>

	<!-- Title -->
	<Text
		text={currentProject?.title ?? ''}
		position={[0, 0, 0.1]}
		font="/fonts/Canterbury/Canterbury.ttf"
		fontSize={device.isMobile ? 0.14 : 0.2}
		anchorX="center"
		anchorY="middle"
		color="#eeeeee"
		fillOpacity={1}
	/>
</T.Group>
