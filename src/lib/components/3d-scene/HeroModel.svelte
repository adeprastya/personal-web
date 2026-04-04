<script lang="ts">
	import { FrontSide } from 'three';
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	const gltf = useGltf('/models/angel_high.glb');
</script>

{#if $gltf}
	<T.Mesh geometry={$gltf.nodes.Mesh10.geometry} rotation={[0, Math.PI, 0]}>
		<T.MeshLambertMaterial side={FrontSide} />
	</T.Mesh>
{/if}
