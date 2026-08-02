<script lang="ts">
	import DarkAmbientEnv from './DarkAmbientEnv.svelte';
</script>

<DarkAmbientEnv
	turbidity={0.08}
	rayleigh={0.002}
	mieCoefficient={0.06}
	mieDirectionalG={0.88}
	exposure={0.14}
	elevation={28}
	azimuth={180}
	scale={10}
/>
