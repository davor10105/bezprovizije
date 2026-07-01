import { PUBLIC_SUPABASE_URL } from '$env/static/public';

import type { SupabaseClient } from '@supabase/supabase-js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

export function isValidSlug(slug: string): boolean {
	return SLUG_PATTERN.test(slug);
}

export function getBlogImageUrl(storagePath: string): string {
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-images/${storagePath}`;
}

export async function ensureUniqueSlug(
	supabase: SupabaseClient,
	baseSlug: string,
	excludeId?: string
): Promise<string> {
	let slug = baseSlug || 'clanak';
	let suffix = 1;

	while (true) {
		const { data } = await supabase.from('blogs').select('id').eq('slug', slug).maybeSingle();

		if (!data || (excludeId && data.id === excludeId)) {
			return slug;
		}

		suffix += 1;
		slug = `${baseSlug}-${suffix}`;
	}
}
