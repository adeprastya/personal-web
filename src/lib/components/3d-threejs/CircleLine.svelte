<script lang="ts">
  import * as THREE from 'three'
  import { useThrelte } from '@threlte/core'

  export let radius = 1
  export let segments = 64
  export let color = '#ffffff'
  export let y = 0
  export let rotation = 0

  const { scene } = useThrelte()

  const points: THREE.Vector3[] = []

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * radius,
        0,
        Math.sin(theta) * radius
      )
    )
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const circle = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color }))

  circle.rotation.x = rotation
  circle.position.y = y

  scene.add(circle)
</script>
