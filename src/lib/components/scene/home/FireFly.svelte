<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import { T, useTask } from '@threlte/core';
	import { Instance, InstancedMesh } from '@threlte/extras';
	import { gsap } from 'gsap';
	import { AdditiveBlending, FrontSide, MathUtils } from 'three';

	interface Props {
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

	type Firefly = {
		freqX: number;
		freqY: number;
		phaseX: number;
		phaseY: number;
		flickerFreq1: number;
		flickerFreq2: number;
		flickerPhase: number;
		localElapsed: number;
		energy: { value: number };
		ref?: ComponentProps<typeof Instance>['ref'];
	};

	const [px, py, pz] = (() => position)();

	/** Pointer interaction state. */
	let hovering = $state(false);
	const hoverPoint = { x: 0, y: 0 };

	/** Smoothed swarm target. */
	let followX = 0;
	let followY = 0;

	/** Shared animation timer. */
	let elapsed = 0;

	/** Base firefly color converted to normalized RGB. */
	const baseR = $derived(((fireflyColor >> 16) & 255) / 255);
	const baseG = $derived(((fireflyColor >> 8) & 255) / 255);
	const baseB = $derived((fireflyColor & 255) / 255);

	/** Per-firefly animation state. */
	const fireflies = $state<Firefly[]>(
		// eslint-disable-next-line svelte/no-unused-svelte-ignore
		// svelte-ignore state_referenced_locally
		Array.from({ length: fireflyCount }, () => ({
			freqX: 1.2 + Math.random(),
			freqY: 0.9 + Math.random() * 1.1,
			phaseX: Math.random() * Math.PI * 2,
			phaseY: Math.random() * Math.PI * 2,
			flickerFreq1: 3 + Math.random() * 2,
			flickerFreq2: 5 + Math.random() * 3,
			flickerPhase: Math.random() * Math.PI * 2,
			localElapsed: Math.random() * 100,
			energy: { value: 1 },
			ref: undefined
		}))
	);

	/** Temporarily boosts the swarm's movement energy. */
	function triggerBurst() {
		for (const firefly of fireflies) {
			gsap.killTweensOf(firefly.energy);

			firefly.energy.value = burstEnergy;

			gsap.to(firefly.energy, {
				value: 1,
				duration: burstDuration,
				ease: 'power2.out'
			});
		}
	}

	/** Updates the swarm target. */
	function updateTarget(x: number, y: number) {
		hoverPoint.x = x - px;
		hoverPoint.y = y - py;
		hovering = true;
	}

	/** Starts a burst and moves the swarm toward the pointer. */
	function handleClick(e: { point: { x: number; y: number } }) {
		updateTarget(e.point.x, e.point.y);
		triggerBurst();
	}

	/** Updates the swarm target while the pointer moves. */
	function handlePointerMove(e: { point: { x: number; y: number } }) {
		updateTarget(e.point.x, e.point.y);
	}

	/** Stops following the pointer. */
	function handlePointerLeave() {
		hovering = false;
	}

	/** Updates firefly movement, color, and flicker every frame. */
	useTask(function runAnimation(delta) {
		elapsed += delta;

		if (hovering) {
			const t = 1 - Math.exp(-delta / followSmooth);

			followX = MathUtils.lerp(followX, hoverPoint.x, t);
			followY = MathUtils.lerp(followY, hoverPoint.y, t);
		}

		for (const firefly of fireflies) {
			if (!firefly.ref) continue;

			const energy = firefly.energy.value;
			const speedMul = 1 + (energy - 1) * 0.8;
			const radiusMul = 1 + (energy - 1) * 1.2;

			firefly.localElapsed += delta * wanderSpeed * speedMul;

			const wx =
				Math.sin(firefly.localElapsed * firefly.freqX * speedMul + firefly.phaseX) *
				wanderRadius *
				radiusMul;

			const wy =
				Math.cos(firefly.localElapsed * firefly.freqY * speedMul + firefly.phaseY) *
				wanderRadius *
				radiusMul;

			firefly.ref.position.set(
				px + followX + wx,
				py + followY + wy,
				pz + 0.02
			);

			const brightness =
				MathUtils.clamp(
					0.5 +
						Math.sin(elapsed * firefly.flickerFreq1 + firefly.flickerPhase) * 0.3 +
						Math.sin(elapsed * firefly.flickerFreq2 + firefly.flickerPhase * 1.7) * 0.2,
					0.15,
					1
				) *
				(0.7 + energy * 0.3);

			const color = (
				firefly.ref as unknown as {
					color?: { setRGB: (r: number, g: number, b: number) => void };
				}
			).color;

			color?.setRGB(baseR * brightness, baseG * brightness, baseB * brightness);
		}
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
	<T.MeshBasicMaterial
		transparent
		opacity={0.95}
		blending={AdditiveBlending}
		depthWrite={false}
	/>
	{#each fireflies as firefly, i (i)}
		<Instance bind:ref={firefly.ref} color={fireflyColor} />
	{/each}
</InstancedMesh>
