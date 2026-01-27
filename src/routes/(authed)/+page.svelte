<script lang="ts">
	import { onMount } from 'svelte';
	import UserRepository from '$lib/repository/userRepository';
	import type { User } from '$lib/functions/user.remote';
	import { toast } from 'svelte-sonner';

	let user = $state<User | undefined>(undefined);

	onMount(async () => {
		try {
			user = await UserRepository.getUser();
		} catch {
			toast.error('Could not get user');
		}
	});
</script>

{#if user}
	<h1>Welcome {user.name}!</h1>
{:else}
	<h1>Loading...</h1>
{/if}
