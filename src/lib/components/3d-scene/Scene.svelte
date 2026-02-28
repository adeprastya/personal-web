<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ScrollSmoother } from 'gsap/ScrollSmoother';
	gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
	
	// Global
	import Camera from './Camera.svelte';
	import HeroModel from './HeroModel.svelte';
  import CircleLine from './CircleLine.svelte';
	// Home
	import BracketText from './BracketText.svelte';

	const { scene, camera } = useThrelte();
	scene.background = new THREE.Color('#09090b');

  function circPos(i: number, y: number): [number, number, number] {
		const startAngle = 0.1
		const radius = 1.25
    const angle = startAngle + (i * Math.PI * 2) / 3
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)]
  }

	let scrollY = $state(0)
	onMount(() => {
		ScrollSmoother.create({ smooth: 4, effects: true, smoothTouch: 0.1 });
		const trigger = ScrollTrigger.create({
			start: 0,
			end: "max",
			scrub: true,
			onUpdate: (self) => scrollY = self.progress
		})

		return () => trigger.kill()
	})

	let rotate = $derived(scrollY * Math.PI * 2)
	let posY = $derived(-1.0 + scrollY * 2)
</script>

<Camera />

<T.Group rotation={[0, rotate, 0]} position={[0, posY, 0]}>
	<HeroModel />

	<BracketText text="DESIGNING IDEAS THAT RESONATE BEYOND VISION" position={circPos(1, 1)} worldCenter={[0, posY + 0.2, 0]} />
	<BracketText text="BLENDING LOGIC AND INTUITION WITH FUNCTION AND BEAUTY" position={circPos(2, 0)} worldCenter={[0, posY + 0.2, 0]} />
	<BracketText text="A PURSUIT OF KNOWLEDGE FUELLED BY ENDLESS CURIOUSITY" position={circPos(3, -1)} worldCenter={[0, posY + 0.2, 0]} />
</T.Group>

<CircleLine radius={0.5} y={0.9} segments={46} color="#777777" />
<CircleLine radius={0.9} y={0.9} segments={58} color="#666666" />
<CircleLine radius={1.4} y={0.9} color="#555555" />
<CircleLine radius={2.0} y={0.9} color="#444444" />
<CircleLine radius={0.5} y={-0.9} segments={46} color="#777777" />
<CircleLine radius={0.9} y={-0.9} segments={46} color="#666666" />
<CircleLine radius={1.4} y={-0.9} segments={58} color="#555555" />
<CircleLine radius={2.0} y={-0.9} color="#444444" />

<T.AmbientLight color={0xffffff} intensity={0.01} castShadow={false} />
<T.DirectionalLight position={[0, 1, 2]} castShadow color={0xffffff} intensity={0.1} />
<T.SpotLight position={[0, 1, 1.5]} castShadow color={0xff0000} intensity={100} angle={Math.PI / 6} penumbra={1} decay={10} />
