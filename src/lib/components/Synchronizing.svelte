<script lang="ts">
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import Centered from '$lib/components/Centered.svelte';
</script>

<Centered>
	<Spinner class="size-44 text-muted-foreground" />
	<p class="text-muted-foreground">Synchronizing with WaniKani</p>
</Centered>
