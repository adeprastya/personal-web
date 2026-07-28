<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	interface Props {
		turbidity?: number;
		rayleigh?: number;
		mieCoefficient?: number;
		mieDirectionalG?: number;
		elevation?: number;
		azimuth?: number;
		exposure?: number;
		scale?: number;
	}

	let {
		turbidity = 0.02,
		rayleigh = 0.001,
		mieCoefficient = 0.9,
		mieDirectionalG = 0.9,
		elevation = 20,
		azimuth = 180,
		exposure = 0.1,
		scale = 100
	}: Props = $props();

	// Same math as three/examples/jsm/objects/Sky.js, stripped down to a
	// single mesh + single shader — no CubeCamera, no render-to-cubemap,
	// no environment map baking. Purely a background visual.
	const vertexShader = `
    uniform vec3 sunPosition;
    uniform float rayleigh;
    uniform float turbidity;
    uniform float mieCoefficient;
    uniform vec3 up;

    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;

    const float e = 2.71828182845904523536028747135266249775724709369995957;
    const float pi = 3.141592653589793238462643383279502884197169;

    const vec3 totalRayleigh = vec3(5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5);
    const vec3 MieConst = vec3(1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14);
    const float cutoffAngle = 1.6110731556870734;
    const float steepness = 1.5;
    const float EE = 1000.0;

    float sunIntensity(float zenithAngleCos) {
      zenithAngleCos = clamp(zenithAngleCos, -1.0, 1.0);
      return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos)) / steepness)));
    }

    vec3 totalMie(float T) {
      float c = (0.2 * T) * 10E-18;
      return 0.434 * c * MieConst;
    }

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_Position.z = gl_Position.w;

      vSunDirection = normalize(sunPosition);
      vSunE = sunIntensity(dot(vSunDirection, up));
      vSunfade = 1.0 - clamp(1.0 - exp(sunPosition.y / 450000.0), 0.0, 1.0);

      float rayleighCoefficient = rayleigh - (1.0 * (1.0 - vSunfade));
      vBetaR = totalRayleigh * rayleighCoefficient;
      vBetaM = totalMie(turbidity) * mieCoefficient;
    }
  `;

	const fragmentShader = `
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;

    uniform float mieDirectionalG;
    uniform float exposure;
    uniform vec3 up;

    const vec3 cameraPos = vec3(0.0, 0.0, 0.0);
    const float pi = 3.141592653589793238462643383279502884197169;
    const float rayleighZenithLength = 8.4E3;
    const float mieZenithLength = 1.25E3;
    const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
    const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
    const float ONE_OVER_FOURPI = 0.07957747154594767;

    float rayleighPhase(float cosTheta) {
      return THREE_OVER_SIXTEENPI * (1.0 + pow(cosTheta, 2.0));
    }

    float hgPhase(float cosTheta, float g) {
      float g2 = pow(g, 2.0);
      float inv = 1.0 / pow(1.0 - 2.0 * g * cosTheta + g2, 1.5);
      return ONE_OVER_FOURPI * ((1.0 - g2) * inv);
    }

    void main() {
      vec3 direction = normalize(vWorldPosition - cameraPos);

      float zenithAngle = acos(max(0.0, dot(up, direction)));
      float inv = 1.0 / (cos(zenithAngle) + 0.15 * pow(93.885 - (zenithAngle * 180.0 / pi), -1.253));
      float sR = rayleighZenithLength * inv;
      float sM = mieZenithLength * inv;

      vec3 Fex = exp(-(vBetaR * sR + vBetaM * sM));

      float cosTheta = dot(direction, vSunDirection);
      float rPhase = rayleighPhase(cosTheta * 0.5 + 0.5);
      vec3 betaRTheta = vBetaR * rPhase;

      float mPhase = hgPhase(cosTheta, mieDirectionalG);
      vec3 betaMTheta = vBetaM * mPhase;

      vec3 Lin = pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * (1.0 - Fex), vec3(1.5));
      Lin *= mix(
        vec3(1.0),
        pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * Fex, vec3(0.5)),
        clamp(pow(1.0 - dot(up, vSunDirection), 5.0), 0.0, 1.0)
      );

      float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta);
      vec3 L0 = vec3(0.1) * Fex + (vSunE * 19000.0 * Fex) * sundisk;

      vec3 texColor = (Lin + L0) * 0.04 + vec3(0.0, 0.001, 0.0025);
      vec3 retColor = sqrt(texColor) * exposure;

      gl_FragColor = vec4(retColor, 1.0);
    }
  `;

	const uniforms = {
		turbidity: { value: (() => turbidity)() },
		rayleigh: { value: (() => rayleigh)() },
		mieCoefficient: { value: (() => mieCoefficient)() },
		mieDirectionalG: { value: (() => mieDirectionalG)() },
		exposure: { value: (() => exposure)() },
		sunPosition: { value: new THREE.Vector3() },
		up: { value: new THREE.Vector3(0, 1, 0) }
	};

	function updateSun() {
		const phi = THREE.MathUtils.degToRad(90 - elevation);
		const theta = THREE.MathUtils.degToRad(azimuth);
		uniforms.sunPosition.value.setFromSphericalCoords(1, phi, theta);
	}
	updateSun();

	// Re-run only when props actually change — not every frame.
	$effect(() => {
		uniforms.turbidity.value = turbidity;
		uniforms.rayleigh.value = rayleigh;
		uniforms.mieCoefficient.value = mieCoefficient;
		uniforms.mieDirectionalG.value = mieDirectionalG;
		uniforms.exposure.value = exposure;
		updateSun();
	});
</script>

<T.Mesh {scale} renderOrder={-100}>
	<T.SphereGeometry args={[1, 32, 15]} />
	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		{uniforms}
		side={THREE.BackSide}
		depthWrite={false}
	/>
</T.Mesh>
