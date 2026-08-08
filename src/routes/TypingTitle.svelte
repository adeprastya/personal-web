<script lang="ts">
	import { AppRoute } from '$lib/types/AppRoute';
	import { route } from '$lib/state/route.svelte';
	import { typingAnimation } from '$lib/utils/typingAnimation';

	// Route title mapping.
	const routeTitles: Record<string, string> = {
		[AppRoute.Home]: 'Ade Prastya',
		[AppRoute.About]: "Don't know me?",
		[AppRoute.Works]: 'Hope you like it!'
	};
	$effect(function animateTitle() {
		typingAnimation(
			routeTitles[route.from],
			routeTitles[route.to],
			(s: string) => (document.title = s || '|'),
			{ delay: 100 }
		);
	});
</script>
