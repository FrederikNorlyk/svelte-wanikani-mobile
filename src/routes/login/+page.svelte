<script lang="ts">
	import BadgeAlert from '@lucide/svelte/icons/badge-alert';
	import { Input } from '$lib/shadcn/components/ui/input';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { login } from '$lib/functions/auth.remote';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import {
		Field,
		FieldDescription,
		FieldError,
		FieldGroup,
		FieldLabel,
		FieldLegend,
		FieldSet
	} from '$lib/shadcn/components/ui/field';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let isFormDisabled = $state(false);
	let apiTokenInput = $state<HTMLInputElement | null>(null);
	let loginButton = $state<HTMLButtonElement | null>(null);
	let form = $state<HTMLFormElement | null>(null);
	let shouldTryClipboardAutopaste = $state(false);

	async function tryAutoPasteFromClipboard() {
		if (!shouldTryClipboardAutopaste || !apiTokenInput) {
			return;
		}

		// If the user already typed/pasted manually, stop trying.
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
			loginButton?.click();
		} catch {
			// Clipboard reads are often denied without a user gesture.
			// Keep the flag true so we can retry on the next focus/visibility change.
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

<form
	{...login.enhance(async ({ submit }) => {
		isFormDisabled = true;
		try {
			await submit();
			if (login.fields.allIssues()) {
				isFormDisabled = false;
			}
		} catch {
			toast.error('Could not log in');
			isFormDisabled = false;
		}
	})}
	bind:this={form}
	class="space-y-4"
>
	<FieldSet>
		<FieldLegend>Login</FieldLegend>
		<FieldDescription
			>You can find your API Token <a
				href="https://www.wanikani.com/settings/personal_access_tokens"
				onclick={() => {
					shouldTryClipboardAutopaste = true;
				}}
				target="_blank">here</a
			>.
		</FieldDescription>
		<div class="flex space-x-1">
			<BadgeAlert class="size-5" />
			<p>
				Make sure it has the permission called <b>reviews:create</b>.
			</p>
		</div>
		<FieldGroup>
			<Field>
				<FieldLabel for="name">API Token</FieldLabel>
				<Input
					{...login.fields._apiToken.as('text')}
					autocomplete="off"
					autofocus={true}
					disabled={isFormDisabled}
					onfocus={tryAutoPasteFromClipboard}
					placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
					bind:ref={apiTokenInput}
				/>
				{#each login.fields._apiToken.issues() as issue, i (issue.message + ':' + i)}
					<FieldError>{issue.message}</FieldError>
				{/each}
			</Field>
		</FieldGroup>
	</FieldSet>

	<Button disabled={isFormDisabled} type="submit" bind:ref={loginButton}>
		{#if isFormDisabled}
			<Spinner />
			Logging in
		{:else}
			Log in
		{/if}
	</Button>
</form>
