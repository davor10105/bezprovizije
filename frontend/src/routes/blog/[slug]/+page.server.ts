import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isAdmin } from '$lib/auth';
import { fetchBlogBySlug } from '$lib/blog/queries';
import { renderMarkdown } from '$lib/blog/markdown';
import { getBlogImageUrl } from '$lib/blog/utils';

export const load: PageServerLoad = async ({ params, locals: { supabase }, parent }) => {
	const { profile } = await parent();
	const blog = await fetchBlogBySlug(supabase, params.slug);

	if (!blog) {
		error(404, 'Članak nije pronađen.');
	}

	const admin = isAdmin(profile);

	if (!blog.is_published && !admin) {
		error(404, 'Članak nije pronađen.');
	}

	return {
		blog: {
			...blog,
			html: renderMarkdown(blog.content),
			coverImage: blog.cover_image_path ? getBlogImageUrl(blog.cover_image_path) : null,
			date: new Date(blog.created_at).toLocaleDateString('hr-HR', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			})
		},
		isAdmin: admin
	};
};
