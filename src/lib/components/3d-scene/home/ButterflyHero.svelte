<script lang="ts">
	import type { Mesh, Group } from 'three';
	import { DoubleSide, ShaderMaterial, MathUtils, Vector3, Quaternion, Matrix4, Color } from 'three';
	import { T, useTask } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { gsap } from 'gsap';

	type Props = {
		planePosition?: [number, number, number];
		planeRotation?: [number, number, number];
		planeSize?: [number, number];

		flapBaseSpeed?: number;
		flapSpeedFromVelocity?: number;
		flapMaxSpeed?: number;

		posSmoothing?: number;
		rotSmoothing?: number;
		bankStrength?: number;
		maxBank?: number;

		levelOutSmoothing?: number;
		idleSpeedThreshold?: number;
	};
	let {
		planePosition = [0, 0, 0],
		planeRotation = [0, 0, 0],
		planeSize = [10, 10],

		flapBaseSpeed = 4,
		flapSpeedFromVelocity = 8,
		flapMaxSpeed = 10,

		posSmoothing = 0.6,
		rotSmoothing = 1.0,
		bankStrength = 0.5,
		maxBank = 45,

		levelOutSmoothing = 4.0,
		idleSpeedThreshold = 0.2
	}: Props = $props();

	const gltf = useGltf('/models/Butterfly.glb');

	let meshPost = $state<Group | undefined>();
	let meshRoll = $state<Group | undefined>();

	let mesh = $state<Mesh | undefined>();
	const mat = new ShaderMaterial({
		side: DoubleSide,
		transparent: true,
		vertexShader: /* glsl */ `
      uniform float uTime;

			varying vec3 vNormal;
			varying vec3 vPos;

      vec3 rotateZ(vec3 pos, vec3 center, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        vec3 p = pos - center;
        vec3 rotated = vec3(
          p.x * c - p.y * s,
          p.x * s + p.y * c,
          p.z
        );
        return rotated + center;
      }

      void main() {
				vNormal = normalize(normalMatrix * normal);
				vPos = position;

        vec3 post = position;
        float timeBranch = uTime;

        vec3 scaledPos = post * vec3(1.0, 1.5, 1.0);
        float dist = distance(scaledPos, vec3(0.0, -1.5, 0.0));
        float distanceBranch = dist * 0.3;

        float waveInput = timeBranch - distanceBranch;
        float wave = sin(waveInput) * 1.0;

        float sideMultiplier = (post.x > 0.0) ? 1.0 : -1.0;

        float finalAngle = wave * sideMultiplier;

        vec3 center = vec3(0.0, 0.0, -1.6);

        vec3 rotatedPosition = rotateZ(post, center, finalAngle);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(rotatedPosition, 1.0);
      }
    `,
		fragmentShader : /* glsl */ `
			uniform float uTime;
			uniform float uSpeed;
			uniform float uRough;
			uniform float uMaxRadius;
			uniform float uWaveCount;

			varying vec3 vPos;
			varying vec3 vNormal;

			vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
			vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
			vec4 permute(vec4 x){return mod289((x*34.+1.)*x);}
			vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

			float snoise(vec3 v){
				const vec2 C=vec2(1./6.,1./3.);
				const vec4 D=vec4(0.,.5,1.,2.);
				vec3 i=floor(v+dot(v,C.yyy));
				vec3 x0=v-i+dot(i,C.xxx);
				vec3 g=step(x0.yzx,x0.xyz);
				vec3 l=1.-g;
				vec3 i1=min(g.xyz,l.zxy);
				vec3 i2=max(g.xyz,l.zxy);
				vec3 x1=x0-i1+C.xxx;
				vec3 x2=x0-i2+C.yyy;
				vec3 x3=x0-D.yyy;
				i=mod289(i);
				vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
				float n=.142857142857;
				vec3 ns=n*D.wyz-D.xzx;
				vec4 j=p-49.*floor(p*ns.z*ns.z);
				vec4 x_=floor(j*ns.z);
				vec4 y_=floor(j-7.*x_);
				vec4 x=x_*ns.x+ns.yyyy;
				vec4 y=y_*ns.x+ns.yyyy;
				vec4 h=1.-abs(x)-abs(y);
				vec4 b0=vec4(x.xy,y.xy),b1=vec4(x.zw,y.zw);
				vec4 s0=floor(b0)*2.+1.,s1=floor(b1)*2.+1.;
				vec4 sh=-step(h,vec4(0.));
				vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
				vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
				vec3 p0=vec3(a0.xy,h.x),p1=vec3(a0.zw,h.y),p2=vec3(a1.xy,h.z),p3=vec3(a1.zw,h.w);
				vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
				p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
				vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
				m*=m;
				return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
			}

			void main(){
				vec3 viewDir=normalize(cameraPosition-vPos);
				float fresnel=pow(1.-max(dot(viewDir,vNormal),0.),2.5);

				vec3 p=vPos*1.8;

				float rough=snoise(p*1.4+vec3(0.,0.,uTime*.05))*uRough;

				float dist=length(p)+rough;

				vec3 darkRed=vec3(.5,.01,.01);
				vec3 midRed=vec3(.75,.08,.05);
				vec3 brightRed=vec3(1.,.25,.25);

				vec3 color=darkRed*fresnel*.45;
				float alpha=fresnel*.35;

				const int MAX_WAVES=10;
				const float WIDTH=.12;
				const float FADE=1.35;

				float cycle=uMaxRadius/uSpeed;

				for(int i=0;i<MAX_WAVES;i++){
						if(i>=int(uWaveCount)) break;

						float radius = mod(
							(uTime-cycle/uWaveCount*float(i))*uSpeed,
							uMaxRadius
						);

						float edgeGlow=1.-smoothstep(0.,WIDTH,abs(dist-radius));

						float age=clamp((radius-dist)*.7,0.,1.);

						float fill=step(dist,radius)*exp(-age*FADE);

						color+=midRed*fill;
						color+=brightRed*edgeGlow*2.2;

						alpha+=fill*.35;
						alpha+=edgeGlow*.75;
				}

				color+=brightRed*fresnel*.3;
				alpha=clamp(alpha,0.,1.);

				gl_FragColor=vec4(color,alpha);
			}
		`,
		uniforms: {
			uColor: { value: new Color(0xff2222) },
			uTime: { value: 0 },
			uSpeed: { value: 0.2 },
			uRough: { value: 0.6 },
			uMaxRadius: { value: 7 },
			uWaveCount: { value: 2.5 },
		}
	});

	const BUTTERFLY_UP = new Vector3(0, 1, 0);
	const MODEL_CORRECTION = new Quaternion();

	const defaultDirection = new Vector3(0, 0, 1);
	const lastDirection = new Vector3().copy(defaultDirection);

	const target = new Vector3();
	const prevPosition = new Vector3();
	const velocity = new Vector3();
	const tmpQuat = new Quaternion();
	const finalQuat = new Quaternion();
	const bankQuat = new Quaternion();
	const lookMatrix = new Matrix4();
	const rightVec = new Vector3();
	const forwardVec = new Vector3();

	const handlePointerMove = (e: { point: Vector3 }) => {
		target.copy(e.point);
	};

	// Throttled butterfly rolling animation on click
	let rolling = { value: 0 };
	let isAnimating = false;
	let rollDirection = 1;
	let currentVelocityX = 0;
	let flapBoost = 0;
	function asymmetricBell(v: number, peak: number, sigmaUp: number, sigmaDown: number): number {
		const sigma = v < peak ? sigmaUp : sigmaDown;
		if (sigma <= 0) return v === peak ? 1 : 0;
		const clampedV = Math.max(0, Math.min(1, v));
		const exponent = -Math.pow((clampedV - peak) / sigma, 2) / 2;
		return Math.exp(exponent);
	}
	const handlePointerClick = () => {
		if (isAnimating || !meshRoll) return;

		isAnimating = true;
		rolling.value = 0;

		const velocityThreshold = 0.05;
		rollDirection =
			Math.abs(currentVelocityX) > velocityThreshold
				? Math.sign(currentVelocityX)
				: Math.random() > 0.5
					? 1
					: -1;

		const radius = 0.6;

		const tl = gsap.timeline({
			onComplete: () => {
				isAnimating = false;
				flapBoost = 0;
			}
		});

		tl.to(rolling, {
			value: 1,
			duration: 4,
			ease: 'sine.inOut',
			onUpdate: () => {
				if (!meshRoll) return;
				const v = rolling.value;
				const theta = v * Math.PI * 2 * rollDirection;

				meshRoll.rotation.z = theta;
				meshRoll.position.x = Math.sin(theta) * radius;
				meshRoll.position.y = (1 - Math.cos(theta)) * radius;

				const bell = asymmetricBell(v, 0.15, 0.08, 0.35);
				flapBoost = bell * 20;
			}
		});
	};

	useTask((delta) => {
		if (!mesh) return;
		if (!meshPost) return;

		if (isAnimating) {
			const flapSpeed = Math.min(flapBaseSpeed + flapBoost, flapMaxSpeed);
			mat.uniforms.uTime.value += delta * flapSpeed;
			return;
		}

		prevPosition.copy(meshPost.position);

		const t = 1 - Math.exp(-posSmoothing * delta);
		meshPost.position.lerp(target, t);

		velocity.subVectors(meshPost.position, prevPosition).divideScalar(delta);
		const speed = velocity.length();

		if (speed > idleSpeedThreshold) {
			lastDirection.copy(velocity).normalize();
			currentVelocityX = velocity.x;
		} else {
			const lt = 1 - Math.exp(-levelOutSmoothing * delta);
			lastDirection.y = MathUtils.lerp(lastDirection.y, 0, lt);
			if (lastDirection.lengthSq() > 1e-6) {
				lastDirection.normalize();
			} else {
				lastDirection.copy(defaultDirection);
			}
		}

		// Rotation change animation (in mesh)
		lookMatrix.lookAt(new Vector3(), lastDirection, BUTTERFLY_UP);
		tmpQuat.setFromRotationMatrix(lookMatrix);
		tmpQuat.multiply(MODEL_CORRECTION);

		rightVec.set(1, 0, 0).applyQuaternion(tmpQuat);
		const lateralSpeed = velocity.dot(rightVec);
		const bankAngle = MathUtils.clamp(-lateralSpeed * bankStrength, -maxBank, maxBank);

		forwardVec.set(0, 0, -1).applyQuaternion(tmpQuat);
		bankQuat.setFromAxisAngle(forwardVec, bankAngle);

		finalQuat.copy(tmpQuat).multiply(bankQuat);

		const rt = 1 - Math.exp(-rotSmoothing * delta);
		mesh.quaternion.slerp(finalQuat, rt);

		// Flapping animation
		const flapSpeed = Math.min(
			flapBaseSpeed + speed * flapSpeedFromVelocity + flapBoost,
			flapMaxSpeed
		);
		mat.uniforms.uTime.value += delta * flapSpeed;
	});
</script>

<!-- Hit-target raycast -->
<T.Mesh
	position={planePosition}
	rotation={planeRotation}
	onpointermove={handlePointerMove}
	onclick={handlePointerClick}
>
	<T.PlaneGeometry args={planeSize} />
	<T.MeshBasicMaterial
		transparent
		opacity={0.0}
		color={0x00ff00}
		side={DoubleSide}
		depthWrite={false}
	/>
</T.Mesh>

<!-- Main butterfly model -->
{#if $gltf}
	<!-- Position manipulation -->
	<T.Group bind:ref={meshPost}>
		<T.Group bind:ref={meshRoll}>
			<!-- Wing & look at manipulation -->
			<T.Mesh
				bind:ref={mesh}
				geometry={$gltf.nodes.Butterfly.geometry}
				material={mat}
				position={[0, 0.1, 0]}
				scale={0.16}
			/>
		</T.Group>
	</T.Group>
{/if}
