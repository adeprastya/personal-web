<script lang="ts">
  import * as THREE from 'three';
  import { T, useThrelte, useTask } from '@threlte/core';
  import { Text } from '@threlte/extras';
	import { onMount } from "svelte";

  interface BracketTextProps {
    text?: string;
    fontSize?: number;
    width?: number;
    height?: number;
    color?: string;
    position?: [number, number, number];
    worldCenter?: [number, number, number];
    visible?: boolean;
  }
  let { text = "HELLO WORLD", fontSize = 0.05, width = 1.0, height = 0.3, color = '#888888', position = [0, 0, 0], worldCenter = [0, 0, 0], visible = true }: BracketTextProps = $props();

  const { camera } = useThrelte()
  let group = $state<THREE.Group | undefined>(undefined);
  let centerLineRef = $state<THREE.Line | undefined>(undefined);

  const lineMat = new THREE.LineBasicMaterial({ color: color, side: THREE.FrontSide, transparent: true, fog: false });
  const bracketMat = new THREE.LineBasicMaterial({ color: color, side: THREE.FrontSide, transparent: true, fog: false });
  const textMat = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true });

  const bracketL = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-width/2, -height/2, 0),
    new THREE.Vector3(-width/2 - width/12, -height/2, 0),
    new THREE.Vector3(-width/2 - width/12, height/2, 0),
    new THREE.Vector3(-width/2, height/2, 0),
  ]);
  const bracketR = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(width/2, -height/2, 0),
    new THREE.Vector3(width/2+ width/12, -height/2, 0),
    new THREE.Vector3(width/2+ width/12, height/2, 0),
    new THREE.Vector3(width/2, height/2, 0),
  ]);

  const temp = new THREE.Vector3()
  const positions = new Float32Array([
    0, 0, 0,
    0, 0, 0
  ])
  const centerLine = new THREE.BufferGeometry()
  centerLine.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )
  const worldPos = new THREE.Vector3();

  let camNear: number;
  let camFar: number;

  onMount(() => {
    camNear = (camera.current as THREE.PerspectiveCamera).near + 1.5
    camFar = (camera.current as THREE.PerspectiveCamera).far - 5.0
  })

  useTask(() => {
    if (!group || !camera.current || !visible) return;

    // Billboard effect
    const camPos = camera.current.position;
    group.lookAt(camPos.x, camPos.y, camPos.z)

    // Distance opacity effect
    group.getWorldPosition(worldPos);
    const distance = worldPos.distanceTo(camPos);
    const opacity = THREE.MathUtils.clamp(1 - (distance - camNear) / (camFar - camNear), 0, 1 );
    textMat.opacity = opacity;
    bracketMat.opacity = opacity;
    lineMat.opacity = opacity * 0.7;

    // Straight Line
    if (!centerLineRef) return;
    temp.copy(new THREE.Vector3(...worldCenter))
    group.worldToLocal(temp)
    const positions = centerLineRef.geometry.attributes.position
      .array as Float32Array
    positions[3] = temp.x
    positions[4] = temp.y
    positions[5] = temp.z
    centerLineRef.geometry.attributes.position.needsUpdate = true
  })
</script> 

<T.Group bind:ref={group} position={position} visible={visible}>
  <T.Line geometry={bracketL} material={bracketMat} />
  <T.Line geometry={bracketR} material={bracketMat} />
  <T.Line bind:ref={centerLineRef} geometry={centerLine} material={lineMat} />

  <Text
    text={text}
    color="#eeeeee"
    font="/fonts/Reddit_Mono/RedditMono-VariableFont_wght.ttf"
    fontSize={fontSize}
    maxWidth={width}
    anchorX="center"
    anchorY="middle"
    textAlign="justify"
    material={textMat}
  />
</T.Group>
