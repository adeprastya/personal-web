import type { Project, ProjectDetails } from '$lib/types/Project';

class ProjectsStore {
	private readonly API_URL = 'https://personal-app-533799590019.us-central1.run.app/api';

	public data = $state<ProjectDetails[]>([]);
	public isLoading = $state<boolean>(false);
	public isLoaded = $state<boolean>(false);

	/**
	 * Fetches project list and details from API
	 *
	 * Must be called once in runtime before accessing the data property
	 */
	async init(fetcher: typeof fetch = fetch) {
		if (this.isLoaded) return;
		this.isLoading = true;

		try {
			// Fetch project list
			const res = await fetcher(`${this.API_URL}/project`).then((res) => res.json());
			const list = Array.isArray(res.data) ? res.data : [];

			// Fetch details for each project
			const detailPromises: Promise<ProjectDetails>[] = list.map(async (p: Project) => {
				const detailRes = await fetcher(`${this.API_URL}/project/${p.id}`).then((res) =>
					res.json()
				);
				return detailRes.data;
			});

			const projects: ProjectDetails[] = await Promise.all(detailPromises);

			this.data = projects;
			this.isLoaded = true;
		} catch (e) {
			console.error(e);
			this.data = [];
			this.isLoaded = true;
		} finally {
			this.isLoading = false;
		}
	}
}

export const projects = new ProjectsStore();
