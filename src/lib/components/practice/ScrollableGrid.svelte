<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	const { children } = $props();
</script>

<Card
	class="grid grid-cols-4 gap-2 p-2 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
>
	{@render children()}
</Card>
