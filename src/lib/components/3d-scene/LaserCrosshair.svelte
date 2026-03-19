<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { useThrelte, useTask } from '@threlte/core'
  import * as THREE from 'three'

  const { scene, camera } = useThrelte()

  // ============ CONSTANTS ============
  const LASER_CONFIG = {
    thickness: 0.004,
    glow: 0.04,
    color: new THREE.Color(1, 0.05, 0.05),
    intensity: 0.2,
    lerpSpeed: 0.15,
    scanInterval: 5000,
    initDelay: 1000,
    raycastThrottle: 6,
    minDistance: 0.001
  }

  // ============ SHADER TEMPLATES ============
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
      vec2 d = abs(vWorldPos.xy - uHitPoint.xy);
      float d1 = abs(d.x - d.y) * 0.707107;
      float d2 = abs(d.x + d.y) * 0.707107;
      float c = max(smoothstep(uThickness, 0.0, d1), smoothstep(uThickness, 0.0, d2));
      float g = max(smoothstep(uGlow, 0.0, d1), smoothstep(uGlow, 0.0, d2));
      gl_FragColor.rgb += (vec3(1.0, 0.9, 0.8) * c * 2.0 + uColor * g * 1.5) * uIntensity;
    }
    #include <dithering_fragment>
  `

  // ============ STATE ============
  const raycaster = new THREE.Raycaster()
  raycaster.params.Line = { threshold: 0.1 }
  raycaster.params.Points = { threshold: 0.1 }

  const mouse = new THREE.Vector2()
  const lastMouse = new THREE.Vector2(-999, -999)
  const targetPoint = new THREE.Vector3()
  const currentPoint = new THREE.Vector3()
  const virtualPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const tempVec3 = new THREE.Vector3()

  const laserUniforms = {
    uHitPoint: { value: currentPoint },
    uActive: { value: 1 },
    uThickness: { value: LASER_CONFIG.thickness },
    uGlow: { value: LASER_CONFIG.glow },
    uColor: { value: LASER_CONFIG.color },
    uIntensity: { value: LASER_CONFIG.intensity }
  }

  let meshes: THREE.Mesh[] = []
  const processedMeshes = new WeakSet<THREE.Mesh>()
  let isScanning = false
  let lastMeshCount = 0

  // ============ SHADER INJECTION ============
  function injectLaser(material: THREE.Material) {
    if (material.userData.__laserInjected) return
    
    const originalCompile = material.onBeforeCompile
    
    material.onBeforeCompile = function(shader, renderer) {
      if (shader.uniforms.uHitPoint) return
      
      if (originalCompile && originalCompile !== material.onBeforeCompile) {
        originalCompile.call(this, shader, renderer)
      }

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
      console.log(`[Laser] Scene changed: ${lastMeshCount} → ${currentCount}, rescanning...`)
      scanScene()
    }
  }

  // ============ ANIMATION ============
  function updateLaserPosition() {
    const dist = currentPoint.distanceToSquared(targetPoint)
    if (dist < LASER_CONFIG.minDistance * LASER_CONFIG.minDistance) return
    
    currentPoint.lerp(targetPoint, LASER_CONFIG.lerpSpeed)
  }

  // ============ RAYCASTING ============
  let raycastCounter = 0
  let mouseMovedThisFrame = false

  function updateLaserTarget() {
    if (!mouseMovedThisFrame) return
    
    raycastCounter++
    if (raycastCounter % LASER_CONFIG.raycastThrottle !== 0) return

    if (!camera.current) return

    raycaster.setFromCamera(mouse, camera.current)
    
    const intersects = raycaster.intersectObjects(meshes, false)

    if (intersects.length > 0) {
      targetPoint.copy(intersects[0].point)
    } else {
      raycaster.ray.intersectPlane(virtualPlane, tempVec3)
      targetPoint.copy(tempVec3)
    }
    
    mouseMovedThisFrame = false
  }

  // ============ LIFECYCLE ============
  onMount(() => {
    setTimeout(scanScene, LASER_CONFIG.initDelay)
    setTimeout(scanScene, LASER_CONFIG.initDelay + 500)
    setTimeout(scanScene, LASER_CONFIG.initDelay + 1000)

    const onMove = (event: PointerEvent) => {
      const newX = (event.clientX / window.innerWidth) * 2 - 1
      const newY = -(event.clientY / window.innerHeight) * 2 + 1
      
      if (Math.abs(newX - lastMouse.x) > 0.001 || Math.abs(newY - lastMouse.y) > 0.001) {
        mouse.x = newX
        mouse.y = newY
        lastMouse.set(newX, newY)
        mouseMovedThisFrame = true
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })

    onDestroy(() => {
      window.removeEventListener('pointermove', onMove)
      meshes.length = 0
      raycaster.layers.disableAll()
    })
  })

  let frameCount = 0
  useTask(() => {
    if (!camera.current) return
    frameCount++
    if (frameCount % LASER_CONFIG.scanInterval === 0) {
      checkSceneChanges()
    }
    updateLaserTarget()
    updateLaserPosition()
  })
</script>
