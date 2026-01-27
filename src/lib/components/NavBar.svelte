<script lang="ts">
	import { Button } from '$lib/shadcn/components/ui/button/index';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { Spinner } from '$lib/shadcn/components/ui/spinner/index';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/subjectsRepository';
	import { logout } from '$lib/functions/auth.remote';

	let isLoggingOut = $state(false);
</script>

<div class="flex justify-between">
	<div class="space-x-1">
		<Button variant="secondary" href="/">Home</Button>
		<Button variant="secondary" href="/review">Review</Button>
	</div>

	<form
		{...logout.enhance(async ({ form, submit }) => {
			isLoggingOut = true;
			try {
				await submit();
			} catch {
				toast.error('Could not log out');
			} finally {
				isLoggingOut = false;
				localStorage.clear();
				await SubjectsRepository.deleteAll();
				form.reset();
			}
		})}
	>
		<Button variant="secondary" type="submit" disabled={isLoggingOut}>
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
