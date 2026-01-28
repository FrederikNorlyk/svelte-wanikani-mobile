<script lang="ts">
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
</script>

<div class="flex flex-1 items-center justify-center">
	<div class="flex flex-col items-center gap-3 text-center">
		<Spinner class="size-44 text-muted-foreground" />
		<div class="text-muted-foreground">Synchronizing with WaniKani</div>
	</div>
</div>
