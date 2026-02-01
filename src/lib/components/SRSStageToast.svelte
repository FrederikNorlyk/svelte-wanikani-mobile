<script lang="ts">
	import type { SRSStage } from '$lib/util/srsStageUtil';

	export type Variant = 'success' | 'error';

	interface Props {
		srsStage: SRSStage;
		variant: Variant;
	}

	const { srsStage, variant }: Props = $props();
</script>

<div
	class="mx-20 rounded-lg p-2"
	class:bg-green-100={variant === 'success'}
	class:bg-red-100={variant === 'error'}
>
	<p
		class="text-center"
		class:text-green-500={variant === 'success'}
		class:text-red-500={variant === 'error'}
	>
		{srsStage}
	</p>
</div>
