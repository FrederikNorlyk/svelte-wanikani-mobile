<script lang="ts">
	import LogOut from '@lucide/svelte/icons/log-out';
	import * as Remote from '$lib/functions/auth.remote';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import * as Database from '$lib/repository/database/database';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/shadcn/components/ui/alert-dialog';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as NotificationUtil from '$lib/util/notificationUtil';

	let isLoggingOut = $state(false);
	let isShowingAlertDialog = $state(false);

	async function logOut() {
		isLoggingOut = true;
		try {
			await NotificationUtil.unregisterPushNotifications();
			await Remote.logOut({});
		} catch {
			toast.error('Could not log out');
		} finally {
			isLoggingOut = false;
			localStorage.clear();
			await Database.deleteAll();
			await goto(resolve('/login'), { replaceState: true });
		}
	}
</script>

<Button
	class="w-full"
	disabled={isLoggingOut}
	onclick={() => {
		isShowingAlertDialog = true;
	}}
	type="button"
	variant="outline"
>
	{#if isLoggingOut}
		<Spinner />
		Logging out
	{:else}
		<LogOut />
		Log out
	{/if}
</Button>

<AlertDialog bind:open={isShowingAlertDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle
				>Are you sure that you want to log out?
			</AlertDialogTitle>
			<AlertDialogDescription
				>This action will reset all of your practice progress.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel class="h-12">Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="h-12"
				onclick={() => {
					isShowingAlertDialog = false;
					logOut();
				}}
				>Log out
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
