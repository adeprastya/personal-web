<script lang="ts">
  import * as THREE from 'three'
  import { T } from '@threlte/core'

  export let radius: number = 1
  export let segments: number = 64
  export let color: string = '#ffffff'
  export let y: number = 0
  export let rotation: number = 0

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
</script>

<T.LineLoop geometry={geometry} material={new THREE.LineBasicMaterial({ color })} position={[0, y, 0]} rotation={[rotation, 0, 0]} />
