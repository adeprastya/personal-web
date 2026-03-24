<script lang="ts">
  import * as THREE from "three"
  import { onMount } from "svelte"
  import { useThrelte, useTask } from '@threlte/core'
  import { deviceData } from "$lib/device.svelte";
  import { pointerData } from "$lib/pointer.svelte";

  const FOV = 50
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
      cam.fov = deviceData.isMobile ? FOV * 1.25 : FOV
      cam.near = NEAR
      cam.far = FAR
      cam.position.z = deviceData.isMobile ? CAMERA_DISTANCE * 1.25 : CAMERA_DISTANCE
      cam.updateProjectionMatrix();
    }
  })

  useTask((delta) => {
    const cam = camera.current
    if (!cam) return

    //  Normalize coordinates
    const newTargetX = (pointerData.x / window.innerWidth) * 2 - 1
    const newTargetY = -(pointerData.y / window.innerHeight) * 2 + 1

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
