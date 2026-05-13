import type { ProjectDetails } from '$lib/types/Project';

export const activeProjectData = $state({
	index: -1 as number,
	data: null as ProjectDetails | null,
	initialized: false as boolean
});

export function setActiveProject(index: number, project: ProjectDetails | null) {
	activeProjectData.index = index;
	activeProjectData.data = project;
	activeProjectData.initialized = true;
}
