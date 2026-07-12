<script lang="ts">
	import { onMount } from 'svelte';
	import { Color } from 'three';
	import { T, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import Camera from './Camera.svelte';
	import SceneGlobal from '$lib/components/3d-scene/global/SceneGlobal.svelte';
	import SceneHome from './home/SceneHome.svelte';
	import SceneAbout from './about/SceneAbout.svelte';
	import SceneWorks from './works/SceneWorks.svelte';

	const { scene } = useThrelte();
	interactivity();
	onMount(() => {
		scene.background = new Color('#09090b');
	});
</script>

<Camera />
<T.AmbientLight intensity={1.0} color="#ffffff" />

<SceneGlobal />
<SceneHome />
<SceneAbout />
<SceneWorks />
