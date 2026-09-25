<script lang="ts">
	import { onMount } from 'svelte';
	import Share from '@lucide/svelte/icons/share';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/button/Button.svelte';

	let isIosBrowser = $state(false);
	let dismissed = $state(false);

	onMount(() => {
		// iPadOS can identify itself as a Mac when requesting desktop websites.
		const isIos =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
		const displayMode = window.matchMedia('(display-mode: standalone)');
		const updateDisplayMode = () => {
			const standalone =
				displayMode.matches ||
				('standalone' in navigator && navigator.standalone === true);
			isIosBrowser = isIos && !standalone;
		};

		updateDisplayMode();
		displayMode.addEventListener('change', updateDisplayMode);
		return () => displayMode.removeEventListener('change', updateDisplayMode);
	});
</script>

{#if isIosBrowser && !dismissed}
	<aside
		class="mx-auto mb-6 w-full max-w-110"
		aria-labelledby="ios-install-title"
	>
		<Card class="flex flex-col gap-4 p-6">
			<h2 id="ios-install-title" class="text-2xl font-semibold">
				Install WaniKani Mobile
			</h2>
			<p>
				Keep WaniKani handy and enable review reminders from your Home Screen.
			</p>
			<ol class="list-decimal space-y-3 pl-5">
				<li>
					In Safari, tap <strong>Share</strong>
					<Share class="inline size-5 align-text-bottom" aria-hidden="true" />.
					You may need to open the browser's menu first.
				</li>
				<li>
					Choose <strong>Add to Home Screen</strong>. If shown, turn on
					<strong>Open as Web App</strong>, then tap <strong>Add</strong>.
				</li>
				<li>Open <strong>WaniKani Mobile</strong> from your Home Screen.</li>
			</ol>
			<p class="text-sm">
				Using another browser? Open this page in Safari first. You may need to
				log in again after installing.
			</p>
			<Button
				buttonColor="sand"
				onclick={() => (dismissed = true)}
				size="small"
				type="button"
			>
				Continue in browser
			</Button>
		</Card>
	</aside>
{/if}
