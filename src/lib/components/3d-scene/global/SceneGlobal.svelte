<script lang="ts">
	import DarkAmbient from './DarkAmbient.svelte';
</script>

<DarkAmbient
	turbidity={0.1}
	rayleigh={0.002}
	mieCoefficient={0.08}
	mieDirectionalG={0.88}
	exposure={0.18}
	elevation={20}
	azimuth={180}
	scale={10}
/>
