<script lang="ts">
	let { text, href }: { text?: string; href?: string } = $props();
</script>

{#if text && href}
	<a
		{href}
		target="_blank"
		class="group flex size-full min-w-[10rem] items-center justify-center gap-2 px-3.5 py-2.5 sm:min-w-[12rem] sm:gap-6 sm:px-4 sm:py-3.5"
	>
		<span
			class="group-hover:animate-glitch inline-block size-1.5 rotate-45 animate-pulse bg-zinc-200 sm:size-2"
		></span>
		<span
			class="text-2xs inline-block cursor-pointer font-mono tracking-widest text-zinc-200 uppercase underline underline-offset-4 group-hover:text-zinc-100 group-active:text-zinc-500 sm:text-xs"
			>{text}
		</span>

		<!-- decoration -->
		<span
			class="absolute top-0 left-0 h-1/2 w-1/8 border-s border-t border-zinc-200/70 transition-all duration-700 group-hover:h-full group-hover:w-full group-hover:border-zinc-200"
		></span>
		<span
			class="absolute right-0 bottom-0 h-1/2 w-1/8 border-e border-b border-zinc-200/70 transition-all duration-700 group-hover:h-full group-hover:w-full group-hover:border-zinc-200"
		></span>
	</a>
{/if}
