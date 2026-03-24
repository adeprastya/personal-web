<script lang="ts">
  import * as THREE from "three"
  import { onMount } from "svelte"
  import { useThrelte, useTask } from '@threlte/core'
  import { pointerData } from "$lib/pointer.svelte";

  const NEAR = 0.1
  const FAR = 10
  const CAMERA_DISTANCE = 2.5
  const LERP_SPEED = 0.05

  const { camera } = useThrelte()

  let targetX = 0
  let targetY = 0
  let t = 0
  let sinCache = { x: 0, y: 0, z: 0 }

  onMount(() => {
    const cam = camera.current
    if (cam instanceof THREE.PerspectiveCamera) {
      cam.near = NEAR
      cam.far = FAR
      cam.updateProjectionMatrix();
      cam.position.z = CAMERA_DISTANCE
    }
  })

  useTask((delta) => {
    const cam = camera.current
    const obs = pointerData.instance
    if (!cam || !obs) return

    //  Normalize coordinates
    const newTargetX = ((obs.x || 0) / window.innerWidth) * 2 - 1
    const newTargetY = -((obs.y || 0) / window.innerHeight) * 2 + 1

    // Lerping
    targetX = newTargetX * 0.5
    targetY = newTargetY * 0.5
    cam.position.x += (targetX - cam.position.x) * LERP_SPEED
    cam.position.y += (targetY - cam.position.y) * LERP_SPEED

    // Ambient Movement (sin)
    t += delta
    sinCache.x = Math.sin(t * 0.7) * 0.05
    sinCache.y = Math.sin(t * 0.9 + 0.4) * 0.03
    sinCache.z = Math.sin(t * 0.5 + 1.6) * 0.01

    // Floating effect
    cam.lookAt(sinCache.x, sinCache.y, 0)
    cam.rotation.z += (sinCache.z - cam.rotation.z) * LERP_SPEED
  })
</script>
