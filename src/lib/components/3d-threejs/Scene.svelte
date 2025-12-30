<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import Camera from './Camera.svelte';
	import HeroModel from './HeroModel.svelte';
  import CircleLine from './CircleLine.svelte';

	const { scene } = useThrelte();
	scene.background = new THREE.Color('#09090b');
</script>

<Camera />

<HeroModel />

<CircleLine radius={1} y={0.9} segments={46} color="#660000" />
<CircleLine radius={1.4} y={0.9} segments={58} color="#550000" />
<CircleLine radius={1.8} y={0.9} color="#440000" />
<CircleLine radius={1} y={-0.9} segments={46} color="#660000" />
<CircleLine radius={1.4} y={-0.9} segments={58} color="#550000" />
<CircleLine radius={1.8} y={-0.9} color="#440000" />

<T.AmbientLight color={0xffffff} intensity={0.01} castShadow={false} />
<T.DirectionalLight position={[0, 1, 2]} castShadow color={0xffffff} intensity={0.1} />
<T.SpotLight position={[0, 1, 1.5]} castShadow color={0xff0000} intensity={100} angle={Math.PI / 6} penumbra={1} decay={10} />
