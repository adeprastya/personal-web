import type { PageLoad } from './$types';
import { projects } from '$lib/stores/projects.svelte';

export const load: PageLoad = async ({ fetch }) => {
	await projects.init(fetch);

	return { projects: projects.data };
};
