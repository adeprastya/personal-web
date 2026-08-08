<script lang="ts">
	import SvgEmail from '$lib/assets/icons/email.svg?component';
	import SvgLinkedIn from '$lib/assets/icons/linkedin.svg?component';
	import SvgGithub from '$lib/assets/icons/github.svg?component';
	import SvgInstagram from '$lib/assets/icons/instagram.svg?component';
	import { audios } from '$lib/audio/sounds';

	const hoverSound = audios.linkHovering;
</script>

<nav
	aria-label="Email & Social Media Links"
	class="flex size-full items-center justify-center gap-3 sm:gap-4"
>
	<!-- Email -->
	<a
		onpointerenter={hoverSound}
		aria-label="Email"
		href="mailto:adefathoniprastya@gmail.com"
		target="_blank"
		class="group"
	>
		<SvgEmail
			class="group-hover:animate-glitch size-4 fill-zinc-700 group-hover:fill-zinc-900 group-active:fill-zinc-500 sm:size-5"
		/>
	</a>

	<!-- Linkedin -->
	<a
		onpointerenter={hoverSound}
		aria-label="LinkedIn"
		href="https://www.linkedin.com/in/adefathoniprastya/"
		target="_blank"
		class="group"
	>
		<SvgLinkedIn
			class="group-hover:animate-glitch size-4 fill-zinc-700 group-hover:fill-zinc-900 group-active:fill-zinc-500 sm:size-5"
		/>
	</a>

	<!-- Github -->
	<a
		onpointerenter={hoverSound}
		aria-label="Github"
		href="https://github.com/adeprastya"
		target="_blank"
		class="group"
	>
		<SvgGithub
			class="group-hover:animate-glitch size-4 fill-zinc-700 group-hover:fill-zinc-900 group-active:fill-zinc-500 sm:size-5"
		/>
	</a>

	<!-- Instagram -->
	<a
		onpointerenter={hoverSound}
		aria-label="Instagram"
		href="https://www.instagram.com/s.c.a.l.a.r"
		target="_blank"
		class="group"
	>
		<SvgInstagram
			class="group-hover:animate-glitch size-4 fill-zinc-700 group-hover:fill-zinc-900 group-active:fill-zinc-500 sm:size-5"
		/>
	</a>
</nav>
