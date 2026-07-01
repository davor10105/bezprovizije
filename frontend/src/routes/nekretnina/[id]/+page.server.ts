import { error } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';
import { PROPERTY_TYPE_SEARCH_LABELS } from '$lib/properties/schema';
import { getProfile, getSafeUser, isAdmin } from '$lib/auth';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const { data: property, error: loadError } = await supabase
		.from('properties')
		.select('*')
		.eq('id', params.id)
		.maybeSingle();

	if (loadError || !property) {
		error(404, 'Nekretnina nije pronađena');
	}

	const { user } = await getSafeUser(supabase);
	const userId = user?.id ?? null;
	const isOwner = userId === property.owner_id;
	const viewerProfile = userId ? await getProfile(supabase, userId) : null;
	const viewerIsAdmin = isAdmin(viewerProfile);

	if (property.approval_status !== 'approved' && !isOwner && !viewerIsAdmin) {
		error(404, 'Nekretnina nije pronađena');
	}

	const { data: images } = await supabase
		.from('property_images')
		.select('storage_path, sort_order')
		.eq('property_id', params.id)
		.order('sort_order');

	const owner = await getProfile(supabase, property.owner_id);

	const imageUrls = (images ?? []).map(
		(img) =>
			`${PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${img.storage_path}`
	);

	return {
		property: {
			id: property.id,
			title: property.title,
			description: property.description,
			price: Number(property.price),
			sqm: Number(property.sqm),
			lat: property.lat,
			lng: property.lng,
			type: PROPERTY_TYPE_SEARCH_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_SEARCH_LABELS],
			property_type: property.property_type,
			status: property.listing_type,
			address: property.address,
			rooms: property.rooms,
			bathrooms: property.bathrooms,
			build_year: property.build_year,
			parking_spaces: property.parking_spaces,
			attributes: property.attributes ?? {},
			approval_status: property.approval_status,
			created_at: property.created_at,
			images:
				imageUrls.length > 0
					? imageUrls
					: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80']
		},
		owner: owner
			? {
					full_name: owner.full_name,
					phone: owner.phone
				}
			: null,
		isOwner,
		isAdmin: viewerIsAdmin
	};
};
