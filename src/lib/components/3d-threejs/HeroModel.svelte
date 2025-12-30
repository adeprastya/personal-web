<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three'
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { useThrelte } from '@threlte/core'

  const { scene, invalidate } = useThrelte()

  const loader = new GLTFLoader();
  let model: THREE.Object3D | null = null

  onMount(async () => {
    const gltf = await loader.loadAsync('models/angel_high.glb');
    model = gltf.scene;
    scene.add(model);

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial();
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    invalidate()
  });

</script>
