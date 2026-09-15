<script lang="ts">
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import crane_game_kani from '$lib/assets/irasutoya/crane_game_kani.png';
	import Centered from '$lib/components/Centered.svelte';
	import Card from '$lib/components/Card.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
</script>

<Centered>
	<Card class="w-full px-6 py-8 sm:px-12 sm:py-10">
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="relative">
				<Illustration
					alt="Illustration of a crane game where you can catch crabs"
					src={crane_game_kani}
				/>

				<div
					class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-30"
				>
					<Spinner class="size-35 text-white" />
				</div>
			</div>
			<p>Synchronizing with WaniKani</p>
		</div>
	</Card>
</Centered>
