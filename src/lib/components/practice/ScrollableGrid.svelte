<script lang="ts">
	const { children } = $props();
</script>

<div class="relative min-h-0 flex-1 rounded-md border bg-muted p-2">
	<div class="h-full overflow-y-auto rounded-md">
		<div
			class="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
		>
			{@render children()}
		</div>
	</div>
</div>
