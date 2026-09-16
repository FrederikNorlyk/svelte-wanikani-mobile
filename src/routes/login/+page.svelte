<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import mascot from '$lib/assets/mascots/boy-and-dog.png';
	import { login } from '$lib/functions/auth.remote';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { FieldError } from '$lib/shadcn/components/ui/field';
	import { Input } from '$lib/shadcn/components/ui/input';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';

	let isFormDisabled = $state(false);
	let apiTokenInput = $state<HTMLInputElement | null>(null);
	let loginButton = $state<HTMLButtonElement | null>(null);
	let form = $state<HTMLFormElement | null>(null);
	let shouldTryClipboardAutopaste = $state(false);

	async function tryAutoPasteFromClipboard() {
		if (!shouldTryClipboardAutopaste || !apiTokenInput) return;
		if (apiTokenInput.value.trim().length > 0) {
			shouldTryClipboardAutopaste = false;
			return;
		}
		if (document.visibilityState !== 'visible' || !document.hasFocus()) return;

		try {
			if (!navigator.clipboard?.readText) return;
			const text = await navigator.clipboard.readText();
			apiTokenInput.value = text.trim();
			shouldTryClipboardAutopaste = false;
			loginButton?.click();
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

<div class="login-page">
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
		class="login-card paper-effect"
	>
		<img
			class="mascot"
			alt="A smiling boy and dog welcoming you"
			src={mascot}
		/>

		<div class="card-content">
			<header class="intro">
				<h1>
					<span aria-hidden="true">✦</span> Connect WaniKani
					<span aria-hidden="true">✦</span>
				</h1>
				<p>
					This app uses your personal WaniKani API token to access your account.
				</p>
			</header>

			<a
				class="token-link"
				href="https://www.wanikani.com/settings/personal_access_tokens"
				onclick={() => {
					shouldTryClipboardAutopaste = true;
				}}
				rel="noreferrer"
				target="_blank"
			>
				<ExternalLink aria-hidden="true" />
				<span>
					<strong>Open WaniKani API token page</strong>
					<small>You’ll be taken to WaniKani’s website.</small>
				</span>
			</a>

			<div class="permission-note">
				<Lightbulb aria-hidden="true" />
				<p>
					Make sure your token has the permission <code>reviews:create</code>.
				</p>
			</div>

			<div class="token-field">
				<label for="api-token">API Token</label>
				<Input
					{...login.fields._apiToken.as('text')}
					id="api-token"
					class="token-input"
					autocomplete="off"
					autofocus={true}
					disabled={isFormDisabled}
					onfocus={tryAutoPasteFromClipboard}
					placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
					bind:ref={apiTokenInput}
				/>
				<p class="field-help">Paste your personal access token to continue.</p>
				{#each login.fields._apiToken.issues() as issue, i (issue.message + ':' + i)}
					<FieldError>{issue.message}</FieldError>
				{/each}
			</div>

			<Button
				class="login-button"
				disabled={isFormDisabled}
				type="submit"
				bind:ref={loginButton}
			>
				{#if isFormDisabled}
					<Spinner />
					Logging in
				{:else}
					<LockKeyhole aria-hidden="true" />
					Log in
				{/if}
			</Button>
		</div>
	</form>
</div>

<style>
	.login-page {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		min-height: 0;
		padding-top: clamp(5rem, 16vh, 9rem);
	}
	.login-card {
		position: relative;
		width: min(100%, 43rem);
		max-height: 100%;
		padding: 0.12rem;
		overflow: visible;
		border: 2px solid #a97b4c;
		border-radius: clamp(2rem, 8vw, 4.25rem);
		background: #fff4d6;
		box-shadow:
			0 0.65rem 0 #d7b67c,
			0 1.1rem 2rem rgb(62 70 38 / 28%);
		color: #5b3a27;
	}
	.login-card::before {
		content: '';
		position: absolute;
		inset: 0.55rem;
		border: 1px solid rgb(255 255 255 / 70%);
		border-radius: inherit;
		pointer-events: none;
	}
	.mascot {
		position: absolute;
		top: 0;
		left: 50%;
		z-index: 3;
		width: clamp(13rem, 52vw, 25rem);
		height: auto;
		filter: drop-shadow(0 0.3rem 0 rgb(87 51 29 / 18%));
		transform: translate(-50%, -69%);
		pointer-events: none;
	}
	.card-content {
		position: relative;
		z-index: 2;
		display: grid;
		gap: clamp(0.8rem, 2vh, 1.15rem);
		max-height: 100%;
		padding: clamp(3rem, 7vh, 4.25rem) clamp(1.25rem, 6vw, 3.6rem)
			clamp(1.5rem, 4vh, 2.8rem);
		overflow-y: auto;
	}
	.intro {
		text-align: center;
	}
	.intro h1 {
		margin: 0;
		font-size: clamp(1.8rem, 7vw, 2.75rem);
		font-weight: 650;
		line-height: 1.1;
		letter-spacing: 0.01em;
	}
	.intro h1 span {
		color: #f5ad24;
		font-size: 0.7em;
	}
	.intro p {
		max-width: 31rem;
		margin: 0.8rem auto 0;
		font-size: clamp(0.98rem, 3.6vw, 1.25rem);
		font-weight: 500;
		line-height: 1.35;
		color: #74543d;
	}
	.token-link {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.85rem;
		min-height: 5rem;
		padding: 0.8rem 1rem;
		border: 2px solid #d8d9a6;
		border-radius: 2rem;
		background: #eff0c9;
		box-shadow: inset 0 1px 0 rgb(255 255 255 / 70%);
		color: #4d813f;
		text-align: left;
		transition:
			transform 150ms ease,
			background 150ms ease;
	}
	.token-link:hover {
		background: #e5e9b8;
		transform: translateY(-1px);
	}
	.token-link:focus-visible {
		outline: 3px solid rgb(77 129 63 / 35%);
		outline-offset: 3px;
	}
	.token-link :global(svg) {
		width: 1.65rem;
		height: 1.65rem;
		stroke-width: 2.6;
	}
	.token-link span {
		display: grid;
		gap: 0.12rem;
	}
	.token-link strong {
		font-size: clamp(1rem, 4vw, 1.25rem);
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}
	.token-link small {
		color: #745b42;
		font-size: clamp(0.8rem, 3vw, 0.95rem);
		font-weight: 500;
	}
	.permission-note {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.85rem 1.15rem;
		border: 2px solid #f5c052;
		border-radius: 1.5rem;
		background: #fff8dc;
		box-shadow: inset 0 1px 0 white;
	}
	.permission-note :global(svg) {
		width: 2rem;
		height: 2rem;
		flex: 0 0 auto;
		color: #d88b0d;
		filter: drop-shadow(0 1px 0 #7d4e28);
	}
	.permission-note p {
		margin: 0;
		font-size: clamp(0.95rem, 3.7vw, 1.15rem);
		font-weight: 550;
		line-height: 1.35;
	}
	.permission-note code {
		padding: 0.1rem 0.5rem;
		border-radius: 0.7rem;
		background: #ffe5a5;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-weight: 700;
		white-space: nowrap;
	}
	.token-field {
		display: grid;
		gap: 0.45rem;
	}
	.token-field label {
		font-size: clamp(1.1rem, 4vw, 1.4rem);
		font-weight: 650;
	}
	:global(.token-input) {
		height: clamp(3.25rem, 7vh, 4.2rem);
		border: 2px solid #b7a58e;
		border-radius: 1.15rem;
		background: #fffdf7;
		padding-inline: 1.15rem;
		color: #5b3a27;
		font-size: clamp(0.9rem, 3.5vw, 1.1rem);
		font-weight: 600;
		box-shadow: inset 0 2px 4px rgb(91 58 39 / 8%);
	}
	:global(.token-input::placeholder) {
		color: #9d958b;
	}
	:global(.token-input:focus-visible) {
		border-color: #e89824;
		box-shadow: 0 0 0 4px rgb(232 152 36 / 20%);
	}
	.field-help {
		margin: 0 0.4rem;
		font-size: clamp(0.82rem, 3.2vw, 1rem);
		font-weight: 500;
		color: #7a6049;
	}
	:global(.login-button) {
		height: clamp(3.8rem, 8vh, 5rem);
		border: 2px solid #9e2c1e;
		border-radius: 999px;
		background: linear-gradient(#ff745f, #ed543f);
		box-shadow:
			inset 0 2px 0 rgb(255 255 255 / 28%),
			0 0.28rem 0 #a63b2d;
		color: #fff9df;
		font-size: clamp(1.35rem, 5vw, 1.8rem);
		font-weight: 600;
		text-shadow: 0 2px 0 rgb(145 48 35 / 28%);
	}
	:global(.login-button:hover) {
		background: linear-gradient(#ff806c, #f35c47);
		transform: translateY(-1px);
	}
	:global(.login-button:active) {
		box-shadow:
			inset 0 2px 0 rgb(255 255 255 / 20%),
			0 0.1rem 0 #a63b2d;
		transform: translateY(0.16rem);
	}
	:global(.login-button svg) {
		width: 1.7rem;
		height: 1.7rem;
	}
	@media (max-height: 760px) {
		.login-page {
			padding-top: 4.25rem;
		}
		.card-content {
			gap: 0.65rem;
			padding-top: 2.5rem;
			padding-bottom: 1.2rem;
		}
		.intro p {
			margin-top: 0.4rem;
		}
		.token-link {
			min-height: 4rem;
			padding-block: 0.55rem;
		}
		.permission-note {
			padding-block: 0.6rem;
		}
	}
	@media (max-width: 560px) {
		.tagline {
			display: none;
		}
		.login-card {
			border-radius: 2.5rem;
		}
		.card-content {
			padding-inline: 1.15rem;
		}
	}
	@media (prefers-color-scheme: dark) {
		.login-card {
			border-color: #8d6a48;
			background: #fff4d6;
			color: #5b3a27;
		}
	}
</style>
