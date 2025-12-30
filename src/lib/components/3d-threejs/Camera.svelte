<script lang="ts">
  import { useThrelte, useTask } from '@threlte/core'
  import { onMount } from "svelte"

  const { camera } = useThrelte()

  let mouseX = 0
  let mouseY = 0

  onMount(() => {
    if (!$camera) return

    $camera.position.z = 2.5

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  })

useTask(() => {
  if (!$camera) return

  const targetX = mouseX * 0.5
  const targetY = mouseY * 0.5
  $camera.position.x += (targetX - $camera.position.x) * 0.05
  $camera.position.y += (targetY - $camera.position.y) * 0.05

  $camera.lookAt(0, 0, 0)
})
</script>
