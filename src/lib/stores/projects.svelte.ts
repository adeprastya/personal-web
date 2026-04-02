import type { Project, ProjectDetails } from '$lib/types/Project';

class ProjectStore {
	isLoading = $state(false);
	projects = $state<ProjectDetails[]>([]);
	isLoaded = $state(false);

	async fetchProjects(fetcher: typeof fetch = fetch) {
		if (this.isLoaded) return;
		this.isLoading = true;

		const API_URL = 'https://personal-app-533799590019.us-central1.run.app/api';

		try {
			// Fetch project list
			const res = await fetcher(`${API_URL}/project`);
			const projectData = await res.json();
			const list = Array.isArray(projectData.data) ? projectData.data : [];

			// Fetch details for each project
			const detailPromises = list.map(async (p: Project) => {
				const detailRes = await fetcher(`${API_URL}/project/${p.id}`);
				const detailData = await detailRes.json();
				return detailData.data;
			});

			const projects = (await Promise.all(detailPromises)) as ProjectDetails[];

			this.projects = projects;
			this.isLoaded = true;
		} catch (e) {
			console.error(e);
			this.projects = [];
			this.isLoaded = true;
		} finally {
			this.isLoading = false;
		}
	}
}

export const projectStore = new ProjectStore();
