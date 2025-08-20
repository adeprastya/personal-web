<script lang="ts">
	import SvgLogo from '$lib/assets/icons/logo.svg?component';
	import SvgEmail from '$lib/assets/icons/email.svg?component';
	import SvgLinkedIn from '$lib/assets/icons/linkedin.svg?component';
	import SvgGithub from '$lib/assets/icons/github.svg?component';
	import SvgInstagram from '$lib/assets/icons/instagram.svg?component';
	import SvgSend from '$lib/assets/icons/PaperPlane.svg?component';

	const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const available = true;

	import { onMount } from 'svelte';
	onMount(() => {
		console.log('APP FRAME MOUNTED');
	});
</script>

<header class="">
	<!-- [TL] name -->
	<div><span class="font-heading">ade prastya</span></div>

	<!-- [TC] logo -->
	<div><SvgLogo /></div>

	<!-- [TR] time -->
	<div><span>{time} [ID]</span></div>

	<!-- [BL] social links -->
	<nav aria-label="Email & Social Media Links">
		<a aria-label="Email" href="mailto:adefathoniprastya@gmail.com" target="_blank"><SvgEmail /></a>
		<a aria-label="LinkedIn" href="https://www.linkedin.com/in/adeprastya/" target="_blank"
			><SvgLinkedIn /></a
		>
		<a aria-label="Github" href="https://github.com/adeprastya" target="_blank"><SvgGithub /></a>
		<a aria-label="Instagram" href="https://www.instagram.com/adeprastya/" target="_blank"
			><SvgInstagram /></a
		>
	</nav>

	<!-- [BR] avail status -->
	<div>
		<span>{available ? 'Open for work' : 'Currently working on'}</span>
	</div>

	<!-- [L1] fast messages -->
	<div>
		<div></div>
		<SvgSend />
	</div>

	<!-- [R1] audio toggle -->
	<div>
		<span></span>
		<span></span>
		<span></span>
		<span></span>
		<span></span>
	</div>

	<!-- [R2] nav -->
	<nav aria-label="Primary Navigation">
		<a href="/">Home</a>
		<a href="/about">About</a>
		<a href="/works">Works</a>
	</nav>

	<!-- toast -->
	<div>
		<span>Toast message goes here</span>
	</div>
</header>
