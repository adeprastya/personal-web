<script lang="ts">
	import { isDev } from '$lib/types/AppStage';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: isDev() ? 'development' : 'production' });
</script>
