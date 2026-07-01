import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';
import { parseBlogForm } from '$lib/blog/form';
import { ensureUniqueSlug, slugify } from '$lib/blog/utils';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	await requireAdmin(supabase);
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const { user } = await requireAdmin(supabase);
		const formData = await request.formData();
		const { payload, errors } = parseBlogForm(formData);

		if (!payload || Object.keys(errors).length > 0) {
			return fail(400, { errors, values: Object.fromEntries(formData) });
		}

		const slug = await ensureUniqueSlug(supabase, slugify(payload.title));

		const { data: blog, error: insertError } = await supabase
			.from('blogs')
			.insert({
				title: payload.title,
				slug,
				description: payload.description,
				content: payload.content,
				is_published: true,
				author_id: user.id
			})
			.select('slug')
			.single();

		if (insertError || !blog) {
			console.error('Blog insert failed:', insertError?.message);
			return fail(500, { errors: { form: 'Spremanje članka nije uspjelo.' } });
		}

		redirect(303, `/blog/${blog.slug}`);
	}
};
