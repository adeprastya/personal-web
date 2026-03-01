<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three'
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { T } from '@threlte/core'

  const loader = new GLTFLoader();
  let model: THREE.Object3D | null = null

  onMount(async () => {
    try {
      const gltf = await loader.loadAsync('models/angel_high.glb');
      model = gltf.scene;

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Cleanup old material
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose())
            } else {
              child.material.dispose()
            }
          }

          child.material = new THREE.MeshLambertMaterial({
            side: THREE.FrontSide,
            color: 0xffffff,
          })

          child.castShadow = true
          child.receiveShadow = true
        }
      });
    } catch (error) {
      console.error('[HeroModel] Load failed:', error)
    }
  });

  onDestroy(() => {
    if (model) {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }
  })
</script>

{#if model}
  <T is={model} rotation={[0, Math.PI, 0]} />
{/if}
