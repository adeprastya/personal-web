import type { PageLoad } from './$types';
import { projectStore } from '$lib/stores/projects.svelte';

export const load: PageLoad = async ({ fetch }) => {
	await projectStore.fetchProjects(fetch);

	return { projects: projectStore.projects };
};
