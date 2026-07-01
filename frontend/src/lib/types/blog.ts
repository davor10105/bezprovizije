export type Blog = {
	id: string;
	slug: string;
	title: string;
	description: string;
	content: string;
	cover_image_path: string | null;
	is_published: boolean;
	author_id: string;
	created_at: string;
	updated_at: string;
};

export type BlogCard = {
	id: string;
	slug: string;
	title: string;
	description: string;
	date: string;
	is_published: boolean;
	coverImage: string | null;
};
