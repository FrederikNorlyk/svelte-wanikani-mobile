<script lang="ts">
	const { children } = $props();
</script>

<div class="flex flex-1 items-center justify-center">
	<div class="flex flex-col items-center gap-3 text-center">
		{@render children()}
	</div>
</div>
