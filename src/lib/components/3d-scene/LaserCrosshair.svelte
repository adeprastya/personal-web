<script lang="ts">
  import { onMount } from 'svelte'
  import * as THREE from 'three'
  import { useThrelte, useTask } from '@threlte/core'
  import { pointerData } from "$lib/pointer.svelte";

  const { scene, camera } = useThrelte()

  // ============ CONSTANTS ============
  const CONFIG = {
    thickness: 0.006, 
    glow: 0.06,
    color: new THREE.Color(1, 0.05, 0.05),
    intensity: 0.2,
    lerpSpeed: 0.2,
    scanInterval: 5000,
    initDelay: 200,
    projectionDepth: 2.5
  }

  // ============ SHADERS ============
  const VERTEX_INJECTION = `
    varying vec3 vWorldPos;
  `
  const VERTEX_REPLACE = `
    #include <worldpos_vertex>
    vWorldPos = worldPosition.xyz;
  `

  const FRAGMENT_INJECTION = `
    varying vec3 vWorldPos;
    uniform vec3 uHitPoint;
    uniform float uActive;
    uniform float uThickness;
    uniform float uGlow;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform vec3 uCameraRight; 
    uniform vec3 uCameraUp; 
  `

  const FRAGMENT_REPLACE = `
    if(uActive > 0.5){
      vec3 diff = vWorldPos - uHitPoint;

      // Proyeksikan diff ke sumbu kamera, bukan world XY
      float dx = dot(diff, uCameraRight);
      float dy = dot(diff, uCameraUp);

      float d1 = abs(dx - dy) * 0.707107;
      float d2 = abs(dx + dy) * 0.707107;

      float c = max(smoothstep(uThickness, 0.0, d1), smoothstep(uThickness, 0.0, d2));
      float g = max(smoothstep(uGlow, 0.0, d1), smoothstep(uGlow, 0.0, d2));

      gl_FragColor.rgb += (vec3(1.0, 0.9, 0.8) * c * 2.0 + uColor * g * 1.5) * uIntensity;
    }
    #include <dithering_fragment>
  `

  // ============ STATE ============
  const targetPoint = new THREE.Vector3()
  const currentPoint = new THREE.Vector3()

  // Hapus projectionPlane statis, ganti dengan yang dinamis
  const projectionPlane = new THREE.Plane()
  const cameraDir = new THREE.Vector3()
  const planeOrigin = new THREE.Vector3()
  const cameraRight = new THREE.Vector3()
  const cameraUp = new THREE.Vector3()

  const laserUniforms = {
    uHitPoint:     { value: currentPoint },
    uActive:       { value: 1 },
    uThickness:    { value: CONFIG.thickness },
    uGlow:         { value: CONFIG.glow },
    uColor:        { value: CONFIG.color },
    uIntensity:    { value: CONFIG.intensity },
    uCameraRight:  { value: cameraRight }, 
    uCameraUp:     { value: cameraUp }, 
  }

  // Reusable objects untuk kalkulasi raycasting
  const raycaster = new THREE.Raycaster()
  const mouseCoords = new THREE.Vector2()

  let meshes: THREE.Mesh[] = []
  const processedMeshes = new WeakSet<THREE.Mesh>()
  let lastCheckTime = 0

  function injectLaser(material: THREE.Material) {
    if (material.userData.__laserInjected) return
    
    material.onBeforeCompile = (shader) => {
      if (shader.uniforms.uHitPoint) return

      Object.assign(shader.uniforms, laserUniforms)

      if (!shader.vertexShader.includes('vWorldPos')) {
        shader.vertexShader = VERTEX_INJECTION + shader.vertexShader.replace('#include <worldpos_vertex>', VERTEX_REPLACE)
      }

      if (!shader.fragmentShader.includes('uHitPoint')) {
        shader.fragmentShader = FRAGMENT_INJECTION + shader.fragmentShader.replace('#include <dithering_fragment>', FRAGMENT_REPLACE)
      }
    }

    material.needsUpdate = true;
    material.userData.__laserInjected = true;
  }

  function processMesh(mesh: THREE.Mesh) {
    if (processedMeshes.has(mesh)) return
    
    meshes.push(mesh)
    processedMeshes.add(mesh)

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => injectLaser(mat))
    } else {
      injectLaser(mesh.material)
    }
  }

  function scanScene() {
    scene.traverse((obj) => {
      if ('geometry' in obj || 'material' in obj) {
        processMesh(obj as THREE.Mesh)
      }
    })
  }

  useTask(() => {
    const cam = camera.current
    if (!cam) return

    // Ekstrak sumbu kamera dari matrix world
    cam.getWorldDirection(cameraDir)
    cameraRight.setFromMatrixColumn(cam.matrixWorld, 0) // kolom X
    cameraUp.setFromMatrixColumn(cam.matrixWorld, 1)    // kolom Y

    // Update projection plane
    planeOrigin.copy(cam.position).addScaledVector(cameraDir, CONFIG.projectionDepth)
    projectionPlane.setFromNormalAndCoplanarPoint(cameraDir, planeOrigin)

    mouseCoords.x = (pointerData.x / window.innerWidth) * 2 - 1
    mouseCoords.y = -(pointerData.y / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouseCoords, cam)
    raycaster.ray.intersectPlane(projectionPlane, targetPoint)

    currentPoint.lerp(targetPoint, CONFIG.lerpSpeed)

    // Get all meshes
    const now = performance.now()
    if (now - lastCheckTime > CONFIG.scanInterval) {
      scanScene()
      lastCheckTime = now
    }
  })

  onMount(() => {
    const timer = setTimeout(scanScene, CONFIG.initDelay)
    return () => {
      clearTimeout(timer)
      meshes.length = 0
    }
  })
</script>
