<script lang="ts">
	import { logout } from '$lib/functions/auth.remote';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import { Button } from '$lib/shadcn/components/ui/button';
	import LogOut from '@lucide/svelte/icons/log-out';

	let { children } = $props();
	let isLoggingOut = $state(false);
</script>

<div class="flex justify-between">
	<div>
		<Button href="/">Home</Button>
		<Button href="/review">Review</Button>
	</div>

	<form
		{...logout.enhance(async ({ form, submit }) => {
			isLoggingOut = true;
			try {
				await submit();
			} finally {
				isLoggingOut = false;
				localStorage.clear();
				form.reset();
			}
		})}
	>
		<Button type="submit" disabled={isLoggingOut}>
			{#if isLoggingOut}
				<Spinner />
				Logging out
			{:else}
				<LogOut />
				Log out
			{/if}
		</Button>
	</form>
</div>

{@render children()}
