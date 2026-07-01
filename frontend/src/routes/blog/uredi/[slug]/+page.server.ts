import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';
import { parseBlogForm } from '$lib/blog/form';
import { fetchBlogBySlug } from '$lib/blog/queries';
import { ensureUniqueSlug, slugify } from '$lib/blog/utils';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	await requireAdmin(supabase);

	const blog = await fetchBlogBySlug(supabase, params.slug);

	if (!blog) {
		error(404, 'Članak nije pronađen.');
	}

	return { blog };
};

export const actions: Actions = {
	update: async ({ request, params, locals: { supabase } }) => {
		await requireAdmin(supabase);

		const existing = await fetchBlogBySlug(supabase, params.slug);

		if (!existing) {
			return fail(404, { errors: { form: 'Članak nije pronađen.' } });
		}

		const formData = await request.formData();
		const { payload, errors } = parseBlogForm(formData);

		if (!payload || Object.keys(errors).length > 0) {
			return fail(400, { errors, values: Object.fromEntries(formData) });
		}

		const slug = await ensureUniqueSlug(supabase, slugify(payload.title), existing.id);

		const { data: blog, error: updateError } = await supabase
			.from('blogs')
			.update({
				title: payload.title,
				slug,
				description: payload.description,
				content: payload.content,
				is_published: true
			})
			.eq('id', existing.id)
			.select('slug')
			.single();

		if (updateError || !blog) {
			console.error('Blog update failed:', updateError?.message);
			return fail(500, { errors: { form: 'Ažuriranje članka nije uspjelo.' } });
		}

		redirect(303, `/blog/${blog.slug}`);
	},

	delete: async ({ params, locals: { supabase } }) => {
		await requireAdmin(supabase);

		const existing = await fetchBlogBySlug(supabase, params.slug);

		if (!existing) {
			return fail(404, { errors: { form: 'Članak nije pronađen.' } });
		}

		const { error: deleteError } = await supabase.from('blogs').delete().eq('id', existing.id);

		if (deleteError) {
			console.error('Blog delete failed:', deleteError.message);
			return fail(500, { errors: { form: 'Brisanje članka nije uspjelo.' } });
		}

		redirect(303, '/blog');
	}
};
