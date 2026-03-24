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
    projectionDepth: 0 
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
  `
  const FRAGMENT_REPLACE = `
    if(uActive > 0.5){
      // Compute distance from world pixel position to laser center
      vec2 d = abs(vWorldPos.xy - uHitPoint.xy);

      // Crosshair logic
      float d1 = abs(d.x - d.y) * 0.707107;
      float d2 = abs(d.x + d.y) * 0.707107;

      float c = max(smoothstep(uThickness, 0.0, d1), smoothstep(uThickness, 0.0, d2));
      float g = max(smoothstep(uGlow, 0.0, d1), smoothstep(uGlow, 0.0, d2));

      gl_FragColor.rgb += (vec3(1.0, 0.9, 0.8) * c * 2.0 + uColor * g * 1.5) * uIntensity;
    }
    #include <dithering_fragment>
  `

  // ============ STATE ============
  const targetPoint = new THREE.Vector3()
  const currentPoint = new THREE.Vector3()
  const projectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -CONFIG.projectionDepth)

  const laserUniforms = {
    uHitPoint: { value: currentPoint },
    uActive: { value: 1 },
    uThickness: { value: CONFIG.thickness },
    uGlow: { value: CONFIG.glow },
    uColor: { value: CONFIG.color },
    uIntensity: { value: CONFIG.intensity }
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

    // Get normalized pointer position (-1, 1)
    mouseCoords.x = (pointerData.x / window.innerWidth) * 2 - 1
    mouseCoords.y = -(pointerData.y / window.innerHeight) * 2 + 1

    // Plane raycast projection
    raycaster.setFromCamera(mouseCoords, cam)
    raycaster.ray.intersectPlane(projectionPlane, targetPoint)

    // Lerping
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
