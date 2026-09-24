<script lang="ts">
	import { cn } from '$lib/shadcn/utils';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<span class={cn('h-6 w-6 rounded-full', className)}></span>

<style>
	span {
		background: light-dark(#e85d4d, #c84f43);
		border: 2px solid light-dark(#bd493d, #a33f36);
		box-shadow:
			0 2px 0 light-dark(#a83f35, #84332c),
			inset 0 1px 0 light-dark(rgb(255 255 255 / 30%), rgb(255 255 255 / 16%));
		animation: pulse 3s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}

		50% {
			opacity: 0.4;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		span {
			animation: none;
		}
	}
</style>
