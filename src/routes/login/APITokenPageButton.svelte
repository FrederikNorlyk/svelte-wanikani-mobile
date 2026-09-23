<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';

	interface Props {
		onclick: () => void;
	}

	const { onclick }: Props = $props();
</script>

<a
	class="flex min-h-20 items-center justify-center gap-3 rounded-4xl border-2 p-2"
	href="https://www.wanikani.com/settings/personal_access_tokens"
	{onclick}
	rel="noreferrer"
	target="_blank"
>
	<ExternalLink aria-hidden="true" strokeWidth="2.5" />
	<span class="grid gap-[0.12rem]">
		<strong
			class="text-[clamp(1rem,4vw,1.25rem)] font-semibold underline underline-offset-[0.18em]"
		>
			Open WaniKani API token page
		</strong>
		<small class="text-[clamp(0.8rem,3vw,0.95rem)] font-medium text-foreground"
			>You’ll be taken to WaniKani’s website.</small
		>
	</span>
</a>

<style>
	a {
		--shadow-color: light-dark(rgb(255 255 255 / 70%), rgb(81 110 61 / 0.7));

		box-shadow: inset 0 1px 0 var(--shadow-color);
		color: light-dark(#4d813f, #d7f0c9);
		border-color: light-dark(#d8d9a6, #2e541c);
		background: light-dark(#eff0c9, #445e42);
	}

	a > :global(svg) {
		height: clamp(1.3rem, 5.2vw, 1.625rem);
		flex-shrink: 0;
	}
</style>
