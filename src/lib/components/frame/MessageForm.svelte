<script lang="ts">
	import SvgSend from '$lib/assets/icons/PaperPlane.svg?component';
	import SvgCross from '$lib/assets/icons/Cross1.svg?component';
	import Trapezoid from '$lib/components/shared/Trapezoid.svelte';
	import InputField from '$lib/components/shared/form-minimalist/InputField.svelte';
	import TextareaField from '$lib/components/shared/form-minimalist/TextareaField.svelte';

	let isOpen = false;
</script>

<form
	aria-label="Fast Message Form"
	class="flex w-full max-w-xs flex-col items-center gap-8 bg-zinc-200 p-6 transition-transform duration-300 will-change-transform"
	style:transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
>
	<p class="font-mono text-sm">Let's collaborate, brainstrom, or simply geek out together.</p>

	<InputField
		name="name"
		wClass="font-body text-sm text-zinc-800"
		label="Name"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		errorMessage="Error message goes here"
		eClass="font-mono text-xs text-red-500"
	/>

	<InputField
		name="email"
		type="email"
		wClass="font-body text-sm text-zinc-800"
		label="Email"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		errorMessage="Error message goes here"
		eClass="font-mono text-xs text-red-500"
	/>

	<TextareaField
		name="message"
		rows={3}
		class="max-h-[25vh] min-h-8"
		wClass="font-body text-sm text-zinc-800"
		label="Message"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		errorMessage="Error placeholder"
		eClass="font-mono text-xs text-red-500"
	/>

	<button
		aria-label="Send Message"
		type="submit"
		class="flex w-full items-center justify-between gap-2 rounded-sm bg-zinc-700 px-4 py-2 transition-colors duration-300 hover:bg-zinc-600 active:bg-zinc-800"
	>
		<span class="font-mono text-sm tracking-widest text-zinc-200">Send Message</span>
		<SvgSend class="fill-zinc-300" />
	</button>

	<Trapezoid
		variant="L"
		slant="2rem"
		class="absolute right-0 bottom-1/2 translate-x-full translate-y-1/2 bg-zinc-200 px-1.5 py-[2.2rem]"
	>
		<button
			aria-label="Toggle Fast Message Form"
			type="button"
			onclick={() => (isOpen = !isOpen)}
			class="group block cursor-pointer"
		>
			{#if isOpen}
				<SvgCross
					class="size-4 fill-zinc-700 transition-colors group-hover:fill-zinc-500 group-active:fill-zinc-900 sm:size-5"
				/>
			{:else}
				<SvgSend
					class="size-4 fill-zinc-700 transition-colors group-hover:fill-zinc-500 group-active:fill-zinc-900 sm:size-5"
				/>
			{/if}
		</button>
	</Trapezoid>
</form>
