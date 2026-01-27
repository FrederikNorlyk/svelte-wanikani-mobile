<script lang="ts">
	import { Input } from '$lib/shadcn/components/ui/input';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { login } from '$lib/functions/auth.remote';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import {
		Field,
		FieldDescription,
		FieldError,
		FieldGroup,
		FieldLabel,
		FieldLegend,
		FieldSet
	} from '$lib/shadcn/components/ui/field';
	import { toast } from 'svelte-sonner';

	let isLoggingIn = $state(false);
</script>

<form
	{...login.enhance(async ({ form, submit }) => {
		isLoggingIn = true;
		try {
			await submit();
		} catch {
			toast.error('Could not log in');
		} finally {
			isLoggingIn = false;
			form.reset();
		}
	})}
	class="space-y-4"
>
	<FieldSet>
		<FieldLegend>Login</FieldLegend>
		<FieldDescription
			>You can find your API Token <a
				target="_blank"
				href="https://www.wanikani.com/settings/personal_access_tokens">here</a
			>.
		</FieldDescription>
		<FieldGroup>
			<Field>
				<FieldLabel for="name">API Token</FieldLabel>
				<Input
					{...login.fields._apiToken.as('text')}
					disabled={isLoggingIn}
					placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
					autocomplete="off"
					autofocus={true}
				/>
				{#each login.fields._apiToken.issues() as issue, i (issue.message + ':' + i)}
					<FieldError>{issue.message}</FieldError>
				{/each}
			</Field>
		</FieldGroup>
	</FieldSet>

	<Button type="submit" disabled={isLoggingIn}>
		{#if isLoggingIn}
			<Spinner />
			Logging in
		{:else}
			Log in
		{/if}
	</Button>
</form>
