<script lang="ts" module>
	function getCircPos(i: number, y: number, radius: number): [number, number, number] {
		const startAngle = 0.1;
		const angle = startAngle + (i * Math.PI * 2) / 3;
		return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
	}
</script>

<script lang="ts">
	import { T, useThrelte, useTask } from '@threlte/core';
	import { useViewport } from '@threlte/extras';
	import { Color } from 'three';

	import { AppRoute } from '$lib/types/Route';
	import { deviceData } from '$lib/contexts/device.svelte';
	import { routeData } from '$lib/contexts/route.svelte';
	import { dragProgress } from '$lib/contexts/dragProgress.svelte';

	import CircleLine from './CircleLine.svelte';
	import BracketText from './BracketText.svelte';
	import Particles from './Particles.svelte';
	import ButterflyHero from './ButterflyHero.svelte';
	import FireFly from './FireFly.svelte';

	const viewport = useViewport();
	const { camera } = useThrelte();

	let isHomePage = $derived(routeData.current === AppRoute.home);
	let progress = $derived(dragProgress.home);

	const dragTransform = {
		rotation: {
			start: 0,
			end: Math.PI * 2
		},
		position: {
			start: -1.5,
			end: 3.5
		},
		worldCenterOffset: 0.2,
		textRadius: 1.25
	};
	const circles = [
		{ radius: 0.5, segments: 32, color: new Color('#fff'), opacity: 0.4 },
		{ radius: 0.9, segments: 44, color: new Color('#fff'), opacity: 0.3 },
		{ radius: 1.4, segments: 60, color: new Color('#fff'), opacity: 0.2 },
		{ radius: 2.0, segments: 64, color: new Color('#fff'), opacity: 0.1 }
	];
	const textItems = [
		{ text: 'DESIGNING IDEAS THAT RESONATE BEYOND VISION', index: 1, y: 1 },
		{ text: 'BLENDING LOGIC AND INTUITION WITH FUNCTION AND BEAUTY', index: 2, y: 0 },
		{ text: 'A PURSUIT OF KNOWLEDGE FUELLED BY ENDLESS CURIOUSITY', index: 3, y: -1 }
	];

	let transform = $derived({
		rotY: dragTransform.rotation.start + progress * dragTransform.rotation.end,
		posY: dragTransform.position.start + progress * dragTransform.position.end
	});
	let textStyle = $derived({
		fontSize: deviceData.isMatchMediaMobile ? 0.05 : 0.038,
		maxWidth: deviceData.isMatchMediaMobile ? 1.0 : 0.7
	});

	// Camera distance calculation for bracket text animation
	let bracText = $state({ nearDistance: 1, farDistance: 1 });
	let throttleAcc = 0;
	const throttleInterval = 1.0;
	useTask((delta) => {
		if (!camera.current) return;

		throttleAcc += delta;
		if (throttleAcc < throttleInterval) return;
		throttleAcc = 0;

		bracText.nearDistance = Math.max(
			0.01,
			camera.current.position.length() - dragTransform.textRadius
		);
		bracText.farDistance = camera.current.position.length() + dragTransform.textRadius;
	});
</script>

<T.Group visible={isHomePage}>
	{#each circles as setting, i (i)}
		<CircleLine {...setting} y={0.9} />
		<CircleLine {...setting} y={-0.9} />
	{/each}

	<Particles
		origin={[0, -2.5, 0]}
		spread={[3, 1, 3]}
		height={6}
		count={80}
		hotColor={[0.8, 0.4, 0.2]}
		coolColor={[1.0, 0.0, 0.0]}
	/>

	<ButterflyHero
		planePosition={[0, 0, 0]}
		planeRotation={[0, 0, 0]}
		planeSize={[viewport.current.width, viewport.current.height]}
	/>

	<T.Group rotation.y={transform.rotY} position.y={transform.posY}>
		{#each textItems as item, i (i)}
			<BracketText
				text={item.text}
				position={getCircPos(item.index, item.y, dragTransform.textRadius)}
				{...textStyle}
				{...bracText}
				plateauWidth={0.1}
				revealSmoothing={0.5}
				updateThrottleMs={80}
				color={new Color('#dedede')}
			/>
		{/each}
	</T.Group>

	<FireFly
		size={[viewport.current.width, viewport.current.height]}
		fireflyCount={5}
		fireflyColor={0xff0000}
		fireflySize={0.015}
		wanderRadius={0.15}
		wanderSpeed={3.0}
		followSmooth={0.1}
		burstEnergy={1.2}
		burstDuration={1.5}
		debug={false}
	/>
</T.Group>
