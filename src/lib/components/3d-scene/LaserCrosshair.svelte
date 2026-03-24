<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { useThrelte, useTask } from '@threlte/core'
  import * as THREE from 'three'

  const { scene, camera } = useThrelte()

  // ============ CONSTANTS ============
  const LASER_CONFIG = {
    thickness: 0.006, 
    glow: 0.06,
    color: new THREE.Color(1, 0.05, 0.05),
    intensity: 0.2,
    lerpSpeed: 0.2,
    scanInterval: 5000,
    initDelay: 1000,
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
  const mouse = new THREE.Vector2()
  const targetPoint = new THREE.Vector3()
  const currentPoint = new THREE.Vector3()

  // Plane cursor to laser projection 
  const projectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -LASER_CONFIG.projectionDepth)

  const laserUniforms = {
    uHitPoint: { value: currentPoint },
    uActive: { value: 1 },
    uThickness: { value: LASER_CONFIG.thickness },
    uGlow: { value: LASER_CONFIG.glow },
    uColor: { value: LASER_CONFIG.color },
    uIntensity: { value: LASER_CONFIG.intensity }
  }
  const tempRay = new THREE.Ray()

  let meshes: THREE.Mesh[] = []
  const processedMeshes = new WeakSet<THREE.Mesh>()
  let isScanning = false
  let lastMeshCount = 0

  // ============ SHADER INJECTION ============
  function injectLaser(material: THREE.Material) {
    if (material.userData.__laserInjected) return
    
    material.onBeforeCompile = function(shader) {
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

  // ============ MESH PROCESSING ============
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
    if (isScanning) return
    isScanning = true

    scene.traverse((obj) => {
      if ('geometry' in obj || 'material' in obj) {
        processMesh(obj as THREE.Mesh)
      }
    })

    lastMeshCount = meshes.length
    isScanning = false
  }

  function checkSceneChanges() {
    let currentCount = 0
    scene.traverse((obj) => {
      if ('geometry' in obj || 'material' in obj) {
        currentCount++
      }
    })
    
    if (currentCount !== lastMeshCount) {
      scanScene()
    }
  }

  // ============ ANIMATION ============
  function updateLaserPosition() {
    currentPoint.lerp(targetPoint, LASER_CONFIG.lerpSpeed)
  }

  // ============ MOUSE PROJECTION ============
  let mouseMovedThisFrame = false

  function updateLaserTargetFromMouse() {
    if (!mouseMovedThisFrame || !camera.current) return

    tempRay.origin.setFromMatrixPosition(camera.current.matrixWorld)
    tempRay.direction.set(mouse.x, mouse.y, 0.5).unproject(camera.current).sub(tempRay.origin).normalize()

    tempRay.intersectPlane(projectionPlane, targetPoint)

    mouseMovedThisFrame = false
  }

  // ============ LIFECYCLE ============
  onMount(() => {
    // Initial scan
    setTimeout(scanScene, LASER_CONFIG.initDelay)
    setTimeout(scanScene, LASER_CONFIG.initDelay + 1000)

    const onMove = (event: PointerEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      mouseMovedThisFrame = true
    }

    window.addEventListener('pointermove', onMove, { passive: true })

    onDestroy(() => {
      window.removeEventListener('pointermove', onMove)
      meshes.length = 0
    })
  })

  // ============ GAME LOOP ============
  let lastCheckTime = 0
  useTask(() => {
    if (!camera.current) return

    updateLaserTargetFromMouse()

    updateLaserPosition()

    const now = performance.now()
    if (now - lastCheckTime > LASER_CONFIG.scanInterval) {
      checkSceneChanges()
      lastCheckTime = now
    }
  })
</script>
