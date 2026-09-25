<script lang="ts">
	import Share from '@lucide/svelte/icons/share';
	import Card from '$lib/components/Card.svelte';
	import AnchorButton from '$lib/components/button/AnchorButton.svelte';
	import { resolve } from '$app/paths';
</script>

<section class="m-auto w-full max-w-110">
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
			Using another browser? Open this page in Safari first. You may need to log
			in again after installing.
		</p>
		<AnchorButton
			buttonColor="red"
			href={resolve('/')}
			size="small"
			type="button"
		>
			Back
		</AnchorButton>
	</Card>
</section>
