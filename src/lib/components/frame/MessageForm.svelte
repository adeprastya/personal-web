<script lang="ts">
	import { PUBLIC_WEB3FORMS_KEY } from '$env/static/public';
	import SvgSend from '$lib/assets/icons/PaperPlane.svg?component';
	import SvgCross from '$lib/assets/icons/Cross1.svg?component';
	import Trapezoid from '$lib/components/shared/Trapezoid.svelte';
	import InputField from '$lib/components/shared/form-minimalist/InputField.svelte';
	import TextareaField from '$lib/components/shared/form-minimalist/TextareaField.svelte';

	let isOpen = $state(false);

	let isSubmitting = $state(false);
	let formStatus = $state<'idle' | 'success' | 'error'>('idle');
	let statusMessage = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;
		formStatus = 'idle';

		const formData = new FormData(event.currentTarget as HTMLFormElement);
		formData.append('access_key', PUBLIC_WEB3FORMS_KEY);

		try {
			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (data.success) {
				formStatus = 'success';
				statusMessage = 'Thanks for reaching out!';
				(event.target as HTMLFormElement).reset();
			} else {
				formStatus = 'error';
				statusMessage = 'Sorry, Something went wrong.';
			}
		} catch {
			formStatus = 'error';
			statusMessage = 'Network error. Please try again later.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form
	aria-label="Fast Message Form"
	onsubmit={handleSubmit}
	class="relative flex w-full max-w-xs flex-col items-center gap-6 bg-zinc-200 p-6 transition-transform duration-300 will-change-transform"
	style:transform={isOpen ? 'translateX(100%)' : 'translateX(0)'}
>
	<p class="font-mono text-sm">Let's collaborate, brainstorm, or simply geek out together.</p>

	<input type="checkbox" name="botcheck" class="hidden" style="display: none;" />

	<InputField
		name="name"
		wClass="font-body text-sm text-zinc-800"
		label="Name"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		required
	/>

	<InputField
		name="email"
		type="email"
		wClass="font-body text-sm text-zinc-800"
		label="Email"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		required
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
		required
	/>

	{#if formStatus !== 'idle'}
		<p
			class="text-center font-mono text-xs {formStatus === 'success'
				? 'text-green-600'
				: 'text-red-500'}"
		>
			{statusMessage}
		</p>
	{/if}

	<button
		aria-label="Send Message"
		type="submit"
		disabled={isSubmitting}
		class="flex w-full items-center justify-between gap-2 rounded-sm bg-zinc-700 px-4 py-2 transition-colors duration-300 hover:bg-zinc-600 active:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
	>
		<span class="font-mono text-sm tracking-widest text-zinc-200">
			{isSubmitting ? 'Sending...' : 'Send Message'}
		</span>
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
