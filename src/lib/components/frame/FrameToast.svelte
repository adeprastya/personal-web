<script lang="ts">
	import { onMount } from 'svelte';

	const content = {
		text: 'Dive into my resume',
		href: '/docs/cv.pdf'
	};

	let isOpen = $state(false);

	function handleWrapperClick(e: MouseEvent) {
		e.stopPropagation();

		if (!isOpen) return (isOpen = true);

		window.open(content.href, '_blank', 'noopener,noreferrer');
	}

	onMount(function createWindowClickListener() {
		const close = () => (isOpen = false);

		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	});
</script>

{#if content.text && content.href}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onclick={(e) => handleWrapperClick(e)}
		aria-expanded={isOpen}
		aria-label="Toggle CTA"
		class="group relative flex size-full items-center justify-center px-3.5 py-2.5 sm:px-4 sm:py-3"
	>
		<!-- Diamond -->
		<div
			class="group-hover:animate-glitch inline-block size-1.5 shrink-0 rotate-45 animate-pulse bg-zinc-200 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))] sm:size-2"
		></div>

		<!-- Main text -->
		<span
			class="overflow-hidden whitespace-nowrap transition-all duration-600 ease-in-out {isOpen
				? 'ml-4 max-w-xl'
				: 'max-w-0'}"
		>
			<a
				href={content.href}
				target="_blank"
				class="text-2xs pointer-events-auto inline-block cursor-pointer font-mono tracking-widest text-zinc-200 uppercase sm:text-xs"
			>
				{content.text}
			</a>
		</span>

		<!-- Decoration -->
		<span
			class="absolute top-0 left-0 size-4 border-s border-t border-zinc-200/70 transition-all duration-700 group-hover:h-full group-hover:w-full group-hover:border-zinc-200"
		></span>
		<span
			class="absolute right-0 bottom-0 size-4 border-e border-b border-zinc-200/70 transition-all duration-700 group-hover:h-full group-hover:w-full group-hover:border-zinc-200"
		></span>
	</div>
{/if}
