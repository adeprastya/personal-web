<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface ITrapezoid extends HTMLAttributes<HTMLDivElement> {
		variant: keyof typeof pathVariants;
		slant: string;
		children: Snippet;
	}

	let { variant = 'TL', slant = '25%', children, ...props }: ITrapezoid = $props();

	const pathVariants = {
		TL: (s: string) => `polygon(0 0, 100% 0, calc(100% - ${s}) 100%, 0 100%)`,
		TC: (s: string) => `polygon(0 0, 100% 0, calc(100% - ${s}) 100%, ${s} 100%)`,
		TR: (s: string) => `polygon(0 0, 100% 0, 100% 100%, ${s} 100%)`,
		BL: (s: string) => `polygon(0 0, calc(100% - ${s}) 0, 100% 100%, 0 100%)`,
		BC: (s: string) => `polygon(${s} 0, calc(100% - ${s}) 0, 100% 100%, 0 100%)`,
		BR: (s: string) => `polygon(${s} 0, 100% 0, 100% 100%, 0 100%)`,
		L: (s: string) => `polygon(0 0, 100% ${s}, 100% calc(100% - ${s}), 0 100%)`,
		R: (s: string) => `polygon(0 ${s}, 100% 0, 100% 100%, 0 calc(100% - ${s}))`
	} as const;

	let clipPath = $derived(pathVariants[variant](slant));
</script>

<div style="clip-path: {clipPath};" {...props}>
	{@render children()}
</div>
