<script lang="ts">
	import { AdditiveBlending, FrontSide, MathUtils, Object3D } from 'three';
	import { T, useTask } from '@threlte/core';
	import { Instance, InstancedMesh } from '@threlte/extras';
	import { gsap } from 'gsap';

	type Props = {
		debug?: boolean;
		position?: [number, number, number];
		size?: [number, number];
		fireflyCount?: number;
		fireflyColor?: number;
		fireflySize?: number;
		wanderRadius?: number;
		wanderSpeed?: number;
		followSmooth?: number;
		burstEnergy?: number;
		burstDuration?: number;
	};
	let {
		debug = false,
		position = [0, 0, 0],
		size = [10, 10],
		fireflyCount = 1,
		fireflyColor = 0xffffff,
		fireflySize = 0.01,
		wanderRadius = 0.35,
		wanderSpeed = 0.35,
		followSmooth = 0.08,
		burstEnergy = 3.5,
		burstDuration = 2
	}: Props = $props();

	let hovering = $state(false);
	const hoverPoint = { x: 0, y: 0 };
	let followX = 0;
	let followY = 0;
	let elapsed = 0;

	let baseR = $derived(((fireflyColor >> 16) & 255) / 255);
	let baseG = $derived(((fireflyColor >> 8) & 255) / 255);
	let baseB = $derived((fireflyColor & 255) / 255);

	const fireflies = $state(
		// eslint-disable-next-line svelte/no-unused-svelte-ignore
		// svelte-ignore state_referenced_locally
		Array.from({ length: fireflyCount }, () => ({
			freqX: 1.2 + Math.random() * 1.0,
			freqY: 0.9 + Math.random() * 1.1,
			phaseX: Math.random() * Math.PI * 2,
			phaseY: Math.random() * Math.PI * 2,
			flickerFreq1: 3 + Math.random() * 2,
			flickerFreq2: 5 + Math.random() * 3,
			flickerPhase: Math.random() * Math.PI * 2,
			localElapsed: Math.random() * 100,
			energy: { value: 1 },
			ref: undefined as Object3D | undefined
		}))
	);

	const goWild = () => {
		for (const f of fireflies) {
			gsap.killTweensOf(f.energy);
			f.energy.value = burstEnergy;

			gsap.to(f.energy, {
				value: 1.0,
				duration: burstDuration,
				ease: 'power2.out'
			});
		}
	};

	const handleClick = (e: { point: { x: number; y: number } }) => {
		hoverPoint.x = e.point.x - position[0];
		hoverPoint.y = e.point.y - position[1];
		hovering = true;
		goWild();
	};

	const handlePointerMove = (e: { point: { x: number; y: number } }) => {
		hoverPoint.x = e.point.x - position[0];
		hoverPoint.y = e.point.y - position[1];
		hovering = true;
	};

	const handlePointerLeave = () => {
		hovering = false;
	};

	useTask((delta) => {
		elapsed += delta;

		if (hovering) {
			const t = 1 - Math.exp(-delta / followSmooth);
			followX = MathUtils.lerp(followX, hoverPoint.x, t);
			followY = MathUtils.lerp(followY, hoverPoint.y, t);
		}

		fireflies.forEach((f) => {
			if (!f.ref) return;

			const energy = f.energy.value;
			const speedMul = 1.0 + (energy - 1.0) * 0.8;
			const radiusMul = 1.0 + (energy - 1.0) * 1.2;

			f.localElapsed += delta * wanderSpeed * speedMul;

			const wx =
				Math.sin(f.localElapsed * f.freqX * speedMul + f.phaseX) * wanderRadius * radiusMul;
			const wy =
				Math.cos(f.localElapsed * f.freqY * speedMul + f.phaseY) * wanderRadius * radiusMul;

			f.ref.position.set(
				position[0] + followX + wx,
				position[1] + followY + wy,
				position[2] + 0.02
			);

			const flicker = MathUtils.clamp(
				0.5 +
					Math.sin(elapsed * f.flickerFreq1 + f.flickerPhase) * 0.3 +
					Math.sin(elapsed * f.flickerFreq2 + f.flickerPhase * 1.7) * 0.2,
				0.15,
				1
			);
			const brightness = flicker * (0.7 + energy * 0.3);

			const c = (
				f.ref as unknown as { color?: { setRGB: (r: number, g: number, b: number) => void } }
			).color;
			c?.setRGB(baseR * brightness, baseG * brightness, baseB * brightness);
		});
	});
</script>

<T.Mesh
	{position}
	onclick={handleClick}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
>
	<T.PlaneGeometry args={size} />
	<T.MeshBasicMaterial
		color={0x00ff00}
		transparent
		opacity={debug ? 0.15 : 0}
		depthWrite={false}
		side={FrontSide}
	/>
</T.Mesh>

<InstancedMesh>
	<T.SphereGeometry args={[fireflySize, 4, 4]} />
	<T.MeshBasicMaterial transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} />
	{#each fireflies as f, i (i)}
		<Instance bind:ref={f.ref} color={fireflyColor} />
	{/each}
</InstancedMesh>
