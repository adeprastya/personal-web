import type { PageServerLoad } from './$types';

// ===== Types ===============
interface Project {
	id: string;
	created_at: string;
	title: string;
	tagline: string;
	image_thumbnail_url: string;
}
interface ProjectDetails extends Project {
	description: string;
	site_url: string;
	source_code_url: string;
	image_preview_urls: string[];
	technologies: string[];
}

export const load: PageServerLoad = async ({ fetch }) => {
	const API_URL = 'https://personal-app-533799590019.us-central1.run.app/api';

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
