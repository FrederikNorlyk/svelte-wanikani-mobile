<script lang="ts">
	// noinspection ES6UnusedImports
	import LogOut from '@lucide/svelte/icons/log-out';
	import { logout } from '$lib/functions/auth.remote';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/subjectsRepository';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';

	let isLoggingOut = $state(false);
</script>

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
	<Button
		class="w-full"
		variant="secondary"
		type="submit"
		disabled={isLoggingOut}
	>
		{#if isLoggingOut}
			<Spinner />
			Logging out
		{:else}
			<LogOut />
			Log out
		{/if}
	</Button>
</form>
