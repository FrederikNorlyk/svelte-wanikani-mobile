<script lang="ts">
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import crane_game_kani from '$lib/assets/irasutoya/crane_game_kani.png';
	import Centered from '$lib/components/Centered.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
</script>

<Centered>
	<div class="relative">
		<Illustration
			src={crane_game_kani}
			alt="Illustration of a crane game in Kushiro, Hokkaido where you can catch crabs"
		>
			Synchronizing with WaniKani
		</Illustration>

		<div
			class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-40"
		>
			<Spinner class="size-40 text-white" />
		</div>
	</div>
</Centered>
