<script lang="ts">
  import { Vector3, BufferGeometry, LineBasicMaterial, FrontSide } from 'three'
  import { T } from '@threlte/core'

  export let radius: number = 1
  export let segments: number = 64
  export let color: string = '#ffffff'
  export let y: number = 0
  export let rotation: number = 0

  const points: Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    points.push(
      new Vector3(
        Math.cos(theta) * radius,
        0,
        Math.sin(theta) * radius
      )
    )
  }
  const geometry = new BufferGeometry().setFromPoints(points)

  const mat = new LineBasicMaterial({ color: color, side: FrontSide })
</script>

<T.LineLoop geometry={geometry} material={mat} position={[0, y, 0]} rotation={[rotation, 0, 0]} />
