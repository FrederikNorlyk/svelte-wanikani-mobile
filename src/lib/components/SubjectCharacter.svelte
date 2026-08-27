<script lang="ts">
	const { subject, class: className = '' } = $props();
</script>

{#if subject.characters}
	<p class={className}>{subject.characters}</p>
{:else if subject.characterImageSvg}
	<span class={className}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags we trust the svg from WaniKani-->
		{@html subject.characterImageSvg}
	</span>
{:else}
	<p class={className}>{subject.primaryMeaning}</p>
{/if}

<style>
	/* Size the icon relative to font-size so it scales with whatever text size
	 the parent passes in. */
	span :global(svg) {
		width: 1em;
		height: 1em;
		display: block;
		margin-top: 4px;
		margin-bottom: 4px;
	}
</style>
