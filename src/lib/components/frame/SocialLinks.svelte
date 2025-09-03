<script lang="ts">
	import SvgEmail from '$lib/assets/icons/email.svg?component';
	import SvgLinkedIn from '$lib/assets/icons/linkedin.svg?component';
	import SvgGithub from '$lib/assets/icons/github.svg?component';
	import SvgInstagram from '$lib/assets/icons/instagram.svg?component';
</script>

<nav
	aria-label="Email & Social Media Links"
	class="flex size-full items-center justify-center gap-3 sm:gap-4"
>
	<a aria-label="Email" href="mailto:adefathoniprastya@gmail.com" target="_blank" class="group">
		<SvgEmail
			class="group-hover:animate-glitch size-4 fill-zinc-700 group-hover:fill-zinc-900 group-active:fill-zinc-500 sm:size-5"
		/>
	</a>

	<a
		aria-label="LinkedIn"
		href="https://www.linkedin.com/in/adefathoniprastya/"
		target="_blank"
		class="group"
	>
		<SvgLinkedIn
			class="group-hover:animate-glitch size-4 fill-zinc-700 group-hover:fill-zinc-900 group-active:fill-zinc-500 sm:size-5"
		/>
	</a>

	<a aria-label="Github" href="https://github.com/adeprastya" target="_blank" class="group">
		<SvgGithub
			class="group-hover:animate-glitch size-4 fill-zinc-700 group-hover:fill-zinc-900 group-active:fill-zinc-500 sm:size-5"
		/>
	</a>

	<a
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
