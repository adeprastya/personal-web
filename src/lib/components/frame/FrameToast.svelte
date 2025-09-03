<script lang="ts">
	let { text, href }: { text?: string; href?: string } = $props();
</script>

{#if text && href}
	<a
		{href}
		target="_blank"
		class="group flex size-full min-w-[12rem] items-center justify-center gap-4 px-4 py-3.5 backdrop-blur-sm sm:min-w-[14rem] sm:gap-6 sm:px-6 sm:py-4"
		style="box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);"
	>
		<span class="group-hover:animate-glitch inline-block size-2 rotate-45 animate-pulse bg-zinc-200"
		></span>
		<span
			class="inline-block cursor-pointer font-mono text-xs text-zinc-300 uppercase underline underline-offset-4 group-hover:text-zinc-100 group-active:text-zinc-500"
			>{text}
		</span>

		<!-- decoration -->
		<span class="absolute top-0 left-0 h-1/2 w-1/6 border-s-3 border-t-3 border-zinc-200"></span>
		<span class="absolute right-0 bottom-0 h-1/2 w-1/6 border-e-3 border-b-3 border-zinc-200"
		></span>
	</a>
{/if}
