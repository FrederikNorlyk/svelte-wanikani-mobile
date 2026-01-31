<script lang="ts">
	import { Button } from '$lib/shadcn/components/ui/button/index.js';
	import { buttonVariants } from '$lib/shadcn/components/ui/button/index.js';
	// noinspection ES6UnusedImports
	import PanelRightOpen from '@lucide/svelte/icons/panel-right-open';
	import {
		Sheet,
		SheetClose,
		SheetContent,
		SheetDescription,
		SheetFooter,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/shadcn/components/ui/sheet';
	import LogOutButton from '$lib/components/LogOutButton.svelte';
</script>

<Sheet>
	<SheetTrigger class="absolute right-6">
		<Button variant="outline" size="icon" aria-label="Submit">
			<PanelRightOpen />
		</Button>
	</SheetTrigger>
	<SheetContent side="right">
		<SheetHeader>
			<SheetTitle>Settings</SheetTitle>
			<SheetDescription>Customize the apps behaviour</SheetDescription>
		</SheetHeader>
		<div class="flex-1 px-4"></div>

		<SheetFooter>
			<LogOutButton />
			<SheetClose class={buttonVariants({ variant: 'outline' })}
				>Close</SheetClose
			>
		</SheetFooter>
	</SheetContent>
</Sheet>
