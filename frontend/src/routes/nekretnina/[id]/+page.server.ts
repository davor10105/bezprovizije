import { error, fail } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Actions, PageServerLoad } from './$types';
import { PROPERTY_TYPE_SEARCH_LABELS } from '$lib/properties/schema';
import { getProfile, getSafeUser, isAdmin, requireAuth } from '$lib/auth';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const [{ data: property, error: loadError }, { user }] = await Promise.all([
		supabase.from('properties').select('*').eq('id', params.id).maybeSingle(),
		getSafeUser(supabase)
	]);

	if (loadError || !property) {
		error(404, 'Nekretnina nije pronađena');
	}

	const userId = user?.id ?? null;
	const isOwner = userId === property.owner_id;

	if (property.approval_status !== 'approved' && !isOwner) {
		const viewerProfile = userId ? await getProfile(supabase, userId) : null;
		if (!isAdmin(viewerProfile)) {
			error(404, 'Nekretnina nije pronađena');
		}
	}

	const [{ data: images }, owner, viewerProfile, favoriteResult] = await Promise.all([
		supabase
			.from('property_images')
			.select('storage_path, sort_order')
			.eq('property_id', params.id)
			.order('sort_order', { ascending: true })
			.order('storage_path', { ascending: true }),
		getProfile(supabase, property.owner_id),
		userId ? getProfile(supabase, userId) : Promise.resolve(null),
		userId
			? supabase
					.from('favorites')
					.select('property_id')
					.eq('user_id', userId)
					.eq('property_id', params.id)
					.maybeSingle()
			: Promise.resolve({ data: null })
	]);

	const viewerIsAdmin = isAdmin(viewerProfile);
	const isFavorited = !!favoriteResult.data;

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
					phone: owner.phone,
					email: owner.email
				}
			: null,
		isOwner,
		isAdmin: viewerIsAdmin,
		isLoggedIn: !!userId,
		isFavorited
	};
};

export const actions: Actions = {
	favorite: async ({ params, locals: { supabase } }) => {
		const { user } = await requireAuth(supabase);

		const { error: insertError } = await supabase
			.from('favorites')
			.insert({ user_id: user.id, property_id: params.id });

		if (insertError && insertError.code !== '23505') {
			console.error('favorite failed:', insertError.message);
			return fail(500, { message: 'Spremanje u favorite nije uspjelo.' });
		}

		return { favorited: true };
	},

	unfavorite: async ({ params, locals: { supabase } }) => {
		const { user } = await requireAuth(supabase);

		const { error: deleteError } = await supabase
			.from('favorites')
			.delete()
			.eq('user_id', user.id)
			.eq('property_id', params.id);

		if (deleteError) {
			console.error('unfavorite failed:', deleteError.message);
			return fail(500, { message: 'Uklanjanje iz favorita nije uspjelo.' });
		}

		return { favorited: false };
	}
};
