<script lang="ts">
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import crane_game_kani from '$lib/assets/irasutoya/crane_game_kani.png';
	import IllustrationLayout from '$lib/components/layouts/IllustrationLayout.svelte';
	import IllustrationCard from '$lib/components/IllustrationCard.svelte';
</script>

<IllustrationLayout>
	<IllustrationCard
		class="relative"
		alt="Illustration of a crane game where you can catch crabs"
		src={crane_game_kani}
	>
		<Spinner class="absolute top-18 size-30 text-white opacity-30" />
		<p>Synchronizing with WaniKani</p>
	</IllustrationCard>
</IllustrationLayout>
