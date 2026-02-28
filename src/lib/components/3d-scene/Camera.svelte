<script lang="ts">
  import { onMount } from "svelte"
  import { useThrelte, useTask } from '@threlte/core'

  const { camera } = useThrelte()

  let mouseX = 0
  let mouseY = 0
  let t = 0

  onMount(() => {
    // Mouse camera movement
    if (!$camera) return
    $camera.position.z = 2.5
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  })

  useTask((delta) => {
    // Static camera movement
    if (!$camera) return
    const targetX = mouseX * 0.5
    const targetY = mouseY * 0.5
    $camera.position.x += (targetX - $camera.position.x) * 0.05
    $camera.position.y += (targetY - $camera.position.y) * 0.05

    t += delta
    $camera.lookAt(
      Math.sin(t * 0.7) * 0.05,
      Math.sin(t * 0.9 + 0.4) * 0.03,
      0)
    $camera.rotation.z = Math.sin(t * 0.5 + 1.6) * 0.01
  })
</script>
