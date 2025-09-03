<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/twailwind';

	interface IInputFieldProps extends HTMLInputAttributes {
		name: string;
		wClass?: string;
		label: string;
		lClass?: string;
		showCounter?: boolean;
		cClass?: string;
		errorMessage?: string;
		eClass?: string;
	}
	let {
		name,
		wClass,
		label,
		lClass,
		showCounter = false,
		cClass,
		errorMessage = '',
		eClass,
		...props
	}: IInputFieldProps = $props();

	let value = $state(props.value ?? '');
	let filled = $derived(!!value);
	let focused = $state(false);
</script>

<div class={cn('relative h-fit w-full', wClass)}>
	<!-- floating label -->
	<label
		for={name}
		class={cn(
			'pointer-events-none absolute top-1 left-2 transition-all duration-300 will-change-transform',
			lClass,
			(filled || focused) && 'top-0 origin-bottom-left -translate-y-full scale-75'
		)}>{label}</label
	>

	<!-- char counter -->
	{#if showCounter}
		<p class={cn('pointer-events-none absolute top-0 right-0.5 text-xs text-zinc-500', cClass)}>
			{value.length}

			{#if props.maxlength || props.max}
				/ {props.maxlength || props.max}
			{/if}
		</p>
	{/if}

	<!-- main input -->
	<input
		{...props}
		{name}
		id={name}
		type={props.type ?? 'text'}
		class={cn('w-full border-b px-2 py-1', props.class)}
		onfocusin={() => (focused = true)}
		onfocusout={() => (focused = false)}
		bind:value
	/>

	<!-- error message -->
	{#if errorMessage}
		<p
			role="alert"
			aria-live="assertive"
			class={cn('absolute top-full left-0 w-full translate-y-0.5 text-xs text-red-400', eClass)}
		>
			{errorMessage}
		</p>
	{/if}
</div>
