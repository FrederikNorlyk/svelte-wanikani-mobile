<script lang="ts">
	import { onMount } from 'svelte';
	import type User from '$lib/model/user';
	import UserRepository from '$lib/repository/userRepository';

	let user = $state<User | undefined>(undefined);

	onMount(async () => {
		user = await UserRepository.getUser();
	});
</script>

{#if user}
	<h1>Welcome {user.name}!</h1>
{:else}
	<h1>Loading...</h1>
{/if}
