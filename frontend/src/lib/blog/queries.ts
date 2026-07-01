import type { SupabaseClient } from '@supabase/supabase-js';
import type { Blog, BlogCard } from '$lib/types/blog';
import { getBlogImageUrl } from '$lib/blog/utils';
import { pageRange } from '$lib/pagination';

export const BLOG_PAGE_SIZE = 6;

type DbBlog = {
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

function toBlogCard(blog: Pick<DbBlog, 'id' | 'slug' | 'title' | 'description' | 'created_at' | 'is_published' | 'cover_image_path'>): BlogCard {
	return {
		id: blog.id,
		slug: blog.slug,
		title: blog.title,
		description: blog.description,
		date: new Date(blog.created_at).toLocaleDateString('hr-HR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}),
		is_published: blog.is_published,
		coverImage: blog.cover_image_path ? getBlogImageUrl(blog.cover_image_path) : null
	};
}

const CARD_SELECT = 'id, slug, title, description, created_at, is_published, cover_image_path';

export async function fetchPublishedBlogCards(
	supabase: SupabaseClient,
	options?: { limit?: number; page?: number; pageSize?: number }
): Promise<{ blogs: BlogCard[]; total: number }> {
	const pageSize = options?.pageSize ?? options?.limit ?? BLOG_PAGE_SIZE;
	const page = options?.page ?? 1;
	const { from, to } = pageRange(page, pageSize);

	const { data, error, count } = await supabase
		.from('blogs')
		.select(CARD_SELECT, { count: 'exact' })
		.eq('is_published', true)
		.order('created_at', { ascending: false })
		.range(from, to);

	if (error) {
		console.error('fetchPublishedBlogCards failed:', error.message);
		return { blogs: [], total: 0 };
	}

	return {
		blogs: (data ?? []).map(toBlogCard),
		total: count ?? 0
	};
}

export async function fetchAdminBlogCards(
	supabase: SupabaseClient,
	page: number,
	pageSize = BLOG_PAGE_SIZE
): Promise<{ blogs: BlogCard[]; total: number }> {
	const { from, to } = pageRange(page, pageSize);

	const { data, error, count } = await supabase
		.from('blogs')
		.select(CARD_SELECT, { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to);

	if (error) {
		console.error('fetchAdminBlogCards failed:', error.message);
		return { blogs: [], total: 0 };
	}

	return {
		blogs: (data ?? []).map(toBlogCard),
		total: count ?? 0
	};
}

export async function fetchRecentBlogCards(
	supabase: SupabaseClient,
	limit = 4
): Promise<BlogCard[]> {
	const { blogs } = await fetchPublishedBlogCards(supabase, { limit, page: 1, pageSize: limit });
	return blogs;
}

export async function fetchBlogBySlug(
	supabase: SupabaseClient,
	slug: string
): Promise<Blog | null> {
	const { data, error } = await supabase
		.from('blogs')
		.select('*')
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		console.error('fetchBlogBySlug failed:', error.message);
		return null;
	}

	return data as Blog | null;
}
