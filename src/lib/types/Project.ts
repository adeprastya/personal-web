export interface Project {
	id: string;
	created_at: string;
	title: string;
	tagline: string;
	image_thumbnail_url: string;
}

export interface ProjectDetails extends Project {
	description: string;
	site_url: string;
	source_code_url: string;
	image_preview_urls: string[];
	technologies: string[];
}
