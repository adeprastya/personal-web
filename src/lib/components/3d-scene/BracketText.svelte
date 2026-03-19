<script lang="ts">
  import * as THREE from 'three';
  import { T, useThrelte, useTask } from '@threlte/core';
  import { Text } from '@threlte/extras';
	import { onMount } from "svelte";

  export let text: string = "HELLO WORLD";
  export let fontSize: number = 0.05;
  export let width: number = 1.0;
  export let height: number = 0.3;
  export let color: string = '#888888';
  export let position: [number, number, number] = [0, 0, 0];
  export let worldCenter: [number, number, number] = [0, 0, 0];

  const { camera } = useThrelte()
  let group: THREE.Group | undefined = undefined;
  let centerLineRef: THREE.Line

  const bracketMat = new THREE.LineBasicMaterial({ color: color, linewidth: 1, side: THREE.FrontSide, transparent: true });
  const lineMat = new THREE.LineBasicMaterial({ color: color, linewidth: 1, side: THREE.FrontSide, transparent: true });
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

  let CAM_NEAR: number;
  let CAM_FAR: number;
  onMount(() => {
    CAM_NEAR = (camera.current as THREE.PerspectiveCamera).near + 1.0
    CAM_FAR = (camera.current as THREE.PerspectiveCamera).far - 5.0
  })

  const worldPos = new THREE.Vector3();
  useTask(() => {
    // Billboard effect
    if (!group || !camera.current) return;
    const camPos = camera.current.position;
    group.lookAt(camPos.x, camPos.y, camPos.z)

    // Distance opacity effect
    group.getWorldPosition(worldPos);
    const distance = worldPos.distanceTo(camPos);
    const opacity = THREE.MathUtils.clamp(1 - (distance - CAM_NEAR) / (CAM_FAR - CAM_NEAR), 0, 1 );
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

<T.Group bind:ref={group} position={position}>
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
