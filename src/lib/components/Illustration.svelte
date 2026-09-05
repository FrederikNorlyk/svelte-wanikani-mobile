<script lang="ts">
	interface Props {
		alt: string;
		src: string;
	}

	const { alt, src }: Props = $props();
</script>

<img {alt} {src} />

<style>
	img {
		width: 200px;
		height: 200px;
		object-fit: contain;
	}
</style>
