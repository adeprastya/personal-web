<script lang="ts">
  import * as THREE from "three"
  import { onMount } from "svelte"
  import { useThrelte, useTask } from '@threlte/core'

  const { camera } = useThrelte()

  const NEAR = 0.1
  const FAR = 10
  const MOUSE_THRESHOLD = 0.001
  const LERP_SPEED = 0.05
  const CAMERA_DISTANCE = 2.5
  const FRAME_SKIP = 4

  let mouseX = 0
  let mouseY = 0
  let lastMouseX = 0
  let lastMouseY = 0
  let t = 0

  onMount(() => {
    const cam = camera.current
    if (!cam) return

    if (cam instanceof THREE.PerspectiveCamera) {
      cam.near = NEAR
      cam.far = FAR
      cam.updateProjectionMatrix();
    }

    cam.position.z = CAMERA_DISTANCE


    const onMouseMove = (e: MouseEvent) => {
      const newX = (e.clientX / window.innerWidth) * 2 - 1
      const newY = -(e.clientY / window.innerHeight) * 2 + 1

      if (Math.abs(newX - lastMouseX) > MOUSE_THRESHOLD || 
          Math.abs(newY - lastMouseY) > MOUSE_THRESHOLD) {
        mouseX = newX
        mouseY = newY
        lastMouseX = newX
        lastMouseY = newY
      }
    }

    window.addEventListener('pointermove', onMouseMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMouseMove)
  })

  let sinCache = {
    x: 0,
    y: 0,
    z: 0
  }

  let frameCount = 0

  useTask((delta) => {
    const cam = camera.current
    if (!cam) return

    frameCount++

    const targetX = mouseX * 0.5
    const targetY = mouseY * 0.5

    const deltaX = targetX - cam.position.x
    const deltaY = targetY - cam.position.y

    if (Math.abs(deltaX) > 0.0001) {
      cam.position.x += deltaX * LERP_SPEED
    }
    if (Math.abs(deltaY) > 0.0001) {
      cam.position.y += deltaY * LERP_SPEED
    }

    if (frameCount % FRAME_SKIP === 0) {
      t += delta
      sinCache.x = Math.sin(t * 0.7) * 0.05
      sinCache.y = Math.sin(t * 0.9 + 0.4) * 0.03
      sinCache.z = Math.sin(t * 0.5 + 1.6) * 0.01
    }
    
    cam.lookAt(sinCache.x, sinCache.y, 0)
    cam.rotation.z = sinCache.z
  })
</script>
