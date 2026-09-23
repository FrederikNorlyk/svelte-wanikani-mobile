<script lang="ts">
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import mascot from '$lib/assets/mascots/boy-and-dog.png';
	import { login } from '$lib/functions/auth.remote';
	import { FieldError } from '$lib/shadcn/components/ui/field';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import PermissionHint from './PermissionHint.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import APITokenPageButton from './APITokenPageButton.svelte';

	let isFormDisabled = $state(false);
	let apiTokenInput = $state<HTMLInputElement | null>(null);
	let form = $state<HTMLFormElement | null>(null);
	let shouldTryClipboardAutopaste = $state(false);

	async function tryAutoPasteFromClipboard() {
		if (!shouldTryClipboardAutopaste || !apiTokenInput) {
			return;
		}

		if (apiTokenInput.value.trim().length > 0) {
			shouldTryClipboardAutopaste = false;
			return;
		}

		if (document.visibilityState !== 'visible' || !document.hasFocus()) {
			return;
		}

		try {
			if (!navigator.clipboard?.readText) {
				return;
			}

			const text = await navigator.clipboard.readText();

			apiTokenInput.value = text.trim();
			shouldTryClipboardAutopaste = false;
			form?.submit();
		} catch {
			// Clipboard reads are often denied without a user gesture.
		}
	}

	onMount(() => {
		const onFocus = () => void tryAutoPasteFromClipboard();
		const onVisibility = () => void tryAutoPasteFromClipboard();
		window.addEventListener('focus', onFocus);
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			window.removeEventListener('focus', onFocus);
			document.removeEventListener('visibilitychange', onVisibility);
			form?.reset();
		};
	});
</script>

<div class="flex flex-1 flex-col items-center justify-center">
	<img
		class="pointer-events-none z-3 -mb-14 w-80 drop-shadow-[0_0.3rem_0_rgb(87_51_29/18%)]"
		alt="A smiling boy and dog welcoming you"
		src={mascot}
	/>
	<Card class="flex flex-col gap-6 p-6">
		<header class="text-center">
			<h1 class="text-[clamp(1.8rem,7vw,2.75rem)] leading-[1.1] font-extrabold">
				<span class="text-[0.7em] text-[#f5ad24]" aria-hidden="true">✦</span>
				Connect WaniKani
				<span class="text-[0.7em] text-[#f5ad24]" aria-hidden="true">✦</span>
			</h1>
			<p
				class="mx-auto mt-[0.6rem] max-w-124 text-[clamp(0.98rem,3.6vw,1.25rem)] font-medium"
			>
				This app uses your personal WaniKani API token to access your account.
			</p>
		</header>

		<div class="flex flex-col gap-2">
			<APITokenPageButton
				onclick={() => {
					shouldTryClipboardAutopaste = true;
				}}
			/>
			<PermissionHint />
		</div>

		<form
			{...login.enhance(async ({ submit }) => {
				isFormDisabled = true;
				try {
					await submit();
					if (login.fields.allIssues()) isFormDisabled = false;
				} catch (e) {
					console.error(e);
					toast.error('Could not log in');
					isFormDisabled = false;
				}
			})}
			bind:this={form}
			class="flex flex-col gap-6"
		>
			<div class="grid gap-[0.45rem]">
				<label
					class="text-[clamp(1.1rem,4vw,1.4rem)] font-[650]"
					for="api-token">API Token</label
				>
				<TextField
					{...login.fields._apiToken.as('text')}
					id="api-token"
					autocomplete="off"
					disabled={isFormDisabled}
					onfocus={tryAutoPasteFromClipboard}
					placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
					required={true}
					bind:ref={apiTokenInput}
				/>

				<p class="mx-2 font-medium">
					Paste your personal access token to continue.
				</p>

				{#each login.fields._apiToken.issues() as issue, i (issue.message + ':' + i)}
					<FieldError>{issue.message}</FieldError>
				{/each}
			</div>

			<Button
				buttonColor="red"
				disabled={isFormDisabled}
				size="large"
				type="submit"
			>
				{#if isFormDisabled}
					<Spinner />
					Logging in
				{:else}
					<LockKeyhole aria-hidden="true" />
					Log in
				{/if}
			</Button>
		</form>
	</Card>
</div>
