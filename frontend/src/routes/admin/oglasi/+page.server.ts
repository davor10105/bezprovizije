import { fail } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';
import {
	LISTING_TYPE_LABELS,
	PROPERTY_TYPE_SEARCH_LABELS,
	getPublicImageUrl
} from '$lib/properties/schema';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: listings, error } = await supabase
		.from('properties')
		.select(
			`id, title, address, price, sqm, property_type, listing_type, approval_status, created_at,
       owner:profiles!owner_id (full_name),
       property_images (storage_path, sort_order)`
		)
		.in('approval_status', ['pending', 'approved', 'rejected'])
		.order('created_at', { ascending: false });

	if (error) {
		return { listings: [], error: error.message };
	}

	const mapped = (listings ?? []).map((row) => {
		const images = [...(row.property_images ?? [])].sort(
			(a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
		);
		const imagePath = images[0]?.storage_path;
		const owner = row.owner as { full_name: string } | null;

		return {
			id: row.id,
			title: row.title,
			address: row.address,
			price: Number(row.price),
			sqm: Number(row.sqm),
			type: PROPERTY_TYPE_SEARCH_LABELS[row.property_type as keyof typeof PROPERTY_TYPE_SEARCH_LABELS],
			listingType: LISTING_TYPE_LABELS[row.listing_type as keyof typeof LISTING_TYPE_LABELS],
			approval_status: row.approval_status,
			ownerName: owner?.full_name ?? '—',
			created_at: row.created_at,
			image: imagePath
				? getPublicImageUrl(PUBLIC_SUPABASE_URL, imagePath)
				: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'
		};
	});

	const pending = mapped.filter((l) => l.approval_status === 'pending');
	const other = mapped.filter((l) => l.approval_status !== 'pending');

	return { pending, other, error: null };
};

export const actions: Actions = {
	approve: async ({ request, locals: { supabase } }) => {
		await requireAdmin(supabase);
		const id = (await request.formData()).get('id') as string;

		if (!id) return fail(400, { message: 'Nedostaje ID oglasa.' });

		const { error } = await supabase
			.from('properties')
			.update({ approval_status: 'approved' })
			.eq('id', id);

		if (error) return fail(500, { message: error.message });
		return { success: true };
	},

	reject: async ({ request, locals: { supabase } }) => {
		await requireAdmin(supabase);
		const id = (await request.formData()).get('id') as string;

		if (!id) return fail(400, { message: 'Nedostaje ID oglasa.' });

		const { error } = await supabase
			.from('properties')
			.update({ approval_status: 'rejected' })
			.eq('id', id);

		if (error) return fail(500, { message: error.message });
		return { success: true };
	}
};
