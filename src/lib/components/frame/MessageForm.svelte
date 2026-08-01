<script lang="ts">
	import { web3Send } from '$lib/utils/messageForm';
	import SvgSend from '$lib/assets/icons/PaperPlane.svg?component';
	import SvgCross from '$lib/assets/icons/Cross1.svg?component';
	import Trapezoid from '$lib/components/shared/Trapezoid.svelte';
	import InputField from '$lib/components/shared/form-minimalist/InputField.svelte';
	import TextareaField from '$lib/components/shared/form-minimalist/TextareaField.svelte';

	let isOpen = $state(false);

	const StatusType = {
		Idle: 'idle',
		Error: 'error',
		Success: 'success'
	} as const;
	type Status = {
		type: (typeof StatusType)[keyof typeof StatusType];
		message: string;
		sending: boolean;
	};
	let status: Status = $state({ type: StatusType.Idle, message: '', sending: false });

	let values = $state({
		name: '',
		email: '',
		message: ''
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		status.sending = true;
		status.type = StatusType.Idle;

		try {
			await web3Send(values.name, values.email, values.message);

			values = { name: '', email: '', message: '' };

			status.type = StatusType.Success;
			status.message = 'Thanks for reaching out!';
		} catch {
			status.type = StatusType.Error;
			status.message = 'Something wrong. Try again later.';
		} finally {
			status.sending = false;
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

	<!-- Name -->
	<InputField
		bind:value={values.name}
		name="name"
		class="outline-zinc-400"
		wClass="font-body text-sm text-zinc-800"
		label="Name"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		required
	/>

	<!-- Email -->
	<InputField
		bind:value={values.email}
		name="email"
		type="email"
		class="outline-zinc-400"
		wClass="font-body text-sm text-zinc-800"
		label="Email"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		required
	/>

	<!-- Message -->
	<TextareaField
		bind:value={values.message}
		name="message"
		rows={3}
		class="max-h-[25vh] min-h-8 outline-zinc-400"
		wClass="font-body text-sm text-zinc-800"
		label="Message"
		lClass="font-mono text-sm text-zinc-800 tracking-wider"
		showCounter={true}
		cClass="font-mono text-xs text-zinc-400"
		required
	/>

	<!-- Submit status -->
	{#if status.type === 'success' || status.type === 'error'}
		<p
			class="text-center font-mono text-xs"
			class:text-green-600={status.type === 'success'}
			class:text-red-600={status.type === 'error'}
		>
			{status.message}
		</p>
	{/if}

	<!-- Send button -->
	<button
		aria-label="Send Message"
		type="submit"
		disabled={status.sending}
		class="flex w-full items-center justify-between gap-2 rounded-sm bg-zinc-700 px-4 py-2 transition-colors duration-300 hover:bg-zinc-600 active:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
	>
		<span class="font-mono text-sm tracking-widest text-zinc-200">
			{status.sending ? 'Sending...' : 'Send Message'}
		</span>
		<SvgSend class="fill-zinc-300" />
	</button>

	<!-- Form toggle -->
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
