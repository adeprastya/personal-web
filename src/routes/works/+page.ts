import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import type { Project, ProjectDetails } from '$lib/types/Project';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	const API_URL = 'https://personal-app-533799590019.us-central1.run.app/api';
	const cacheDuration = 60 * 60 * 24; // 24 hours in seconds

	try {
		// Fetch project list
		const res = await fetch(`${API_URL}/project`);
		const projectData = await res.json();
		const list = Array.isArray(projectData.data) ? projectData.data : [];

		// Fetch details for each project
		const detailPromises = list.map(async (p: Project) => {
			const detailRes = await fetch(`${API_URL}/project/${p.id}`);
			const detailData = await detailRes.json();
			return detailData.data;
		});

		const projects = (await Promise.all(detailPromises)) as ProjectDetails[];

		if (!browser) {
			setHeaders({
				'cache-control': `public, max-age=${cacheDuration}`
			});
		}

		return {
			projects,
			error: null
		};
	} catch {
		return {
			projects: [],
			error: 'Im, sorry. Something went wrong.'
		};
	}
};
