<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three'
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { T } from '@threlte/core'

  const loader = new GLTFLoader();
  let model: THREE.Object3D | null = null

  onMount(async () => {
    const gltf = await loader.loadAsync('models/angel_high.glb');
    model = gltf.scene;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial({side: THREE.FrontSide});
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
</script>

{#if model}
  <T is={model} rotation={[0, Math.PI, 0]} />
{/if}
