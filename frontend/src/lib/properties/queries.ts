import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ApprovalStatus, ListingType, PropertyType } from '$lib/types/property';
import {
	LISTING_TYPE_LABELS,
	PROPERTY_TYPE_SEARCH_LABELS,
	getPublicImageUrl
} from '$lib/properties/schema';
import { pageRange } from '$lib/pagination';

const FALLBACK_IMAGE =
	'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

export type ListingCard = {
	id: string;
	title: string;
	address: string;
	price: number;
	sqm: number;
	type: string;
	property_type: PropertyType;
	status: ListingType;
	rooms: number | null;
	bathrooms: number | null;
	dateAdded: string;
	image: string;
	lat: number;
	lng: number;
	attributes: Record<string, string | number | boolean>;
};

export type UserListing = {
	id: string;
	title: string;
	address: string;
	price: number;
	approval_status: ApprovalStatus;
	listing_type: ListingType;
	property_type: PropertyType;
	created_at: string;
	image: string;
};

export type AdminListing = {
	id: string;
	title: string;
	address: string;
	price: number;
	sqm: number;
	type: string;
	listingType: string;
	approval_status: ApprovalStatus;
	ownerName: string;
	created_at: string;
	image: string;
};

type DbAdminProperty = {
	id: string;
	title: string;
	address: string;
	price: number;
	sqm: number;
	property_type: PropertyType;
	listing_type: ListingType;
	approval_status: ApprovalStatus;
	created_at: string;
	owner: { full_name: string } | null;
	property_images: { storage_path: string; sort_order: number }[] | null;
};

type DbProperty = {
	id: string;
	title: string;
	address: string;
	price: number;
	sqm: number;
	property_type: PropertyType;
	listing_type: ListingType;
	rooms: number | null;
	bathrooms: number | null;
	lat: number;
	lng: number;
	attributes: Record<string, string | number | boolean> | null;
	created_at: string;
	property_images: { storage_path: string; sort_order: number }[] | null;
};

type DbUserProperty = {
	id: string;
	title: string;
	address: string;
	price: number;
	approval_status: ApprovalStatus;
	listing_type: ListingType;
	property_type: PropertyType;
	created_at: string;
	property_images: { storage_path: string; sort_order: number }[] | null;
};

export function toListingCard(property: DbProperty): ListingCard {
	const images = [...(property.property_images ?? [])].sort(
		(a, b) => a.sort_order - b.sort_order
	);
	const firstImage = images[0]?.storage_path;

	return {
		id: property.id,
		title: property.title,
		address: property.address,
		price: Number(property.price),
		sqm: Number(property.sqm),
		type: PROPERTY_TYPE_SEARCH_LABELS[property.property_type],
		property_type: property.property_type,
		status: property.listing_type,
		rooms: property.rooms,
		bathrooms: property.bathrooms,
		dateAdded: property.created_at,
		image: firstImage ? getPublicImageUrl(PUBLIC_SUPABASE_URL, firstImage) : FALLBACK_IMAGE,
		lat: property.lat,
		lng: property.lng,
		attributes: property.attributes ?? {}
	};
}

function toUserListing(property: DbUserProperty): UserListing {
	const images = [...(property.property_images ?? [])].sort(
		(a, b) => a.sort_order - b.sort_order
	);
	const firstImage = images[0]?.storage_path;

	return {
		id: property.id,
		title: property.title,
		address: property.address,
		price: Number(property.price),
		approval_status: property.approval_status,
		listing_type: property.listing_type,
		property_type: property.property_type,
		created_at: property.created_at,
		image: firstImage ? getPublicImageUrl(PUBLIC_SUPABASE_URL, firstImage) : FALLBACK_IMAGE
	};
}

export async function fetchApprovedListings(supabase: SupabaseClient): Promise<ListingCard[]> {
	const { data, error } = await supabase
		.from('properties')
		.select(
			`id, title, address, price, sqm, property_type, listing_type,
       rooms, bathrooms, lat, lng, attributes, created_at,
       property_images (storage_path, sort_order)`
		)
		.eq('approval_status', 'approved')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('fetchApprovedListings failed:', error.message);
		return [];
	}

	return (data as DbProperty[]).map(toListingCard);
}

export async function fetchUserListings(
	supabase: SupabaseClient,
	userId: string
): Promise<UserListing[]> {
	const { data, error } = await supabase
		.from('properties')
		.select(
			`id, title, address, price, approval_status, listing_type, property_type, created_at,
       property_images (storage_path, sort_order)`
		)
		.eq('owner_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('fetchUserListings failed:', error.message);
		return [];
	}

	return (data as DbUserProperty[]).map(toUserListing);
}

function toAdminListing(property: DbAdminProperty): AdminListing {
	const images = [...(property.property_images ?? [])].sort(
		(a, b) => a.sort_order - b.sort_order
	);
	const firstImage = images[0]?.storage_path;

	return {
		id: property.id,
		title: property.title,
		address: property.address,
		price: Number(property.price),
		sqm: Number(property.sqm),
		type: PROPERTY_TYPE_SEARCH_LABELS[property.property_type],
		listingType: LISTING_TYPE_LABELS[property.listing_type],
		approval_status: property.approval_status,
		ownerName: property.owner?.full_name ?? '—',
		created_at: property.created_at,
		image: firstImage ? getPublicImageUrl(PUBLIC_SUPABASE_URL, firstImage) : FALLBACK_IMAGE
	};
}

const ADMIN_LISTING_SELECT = `id, title, address, price, sqm, property_type, listing_type, approval_status, created_at,
  owner:profiles!owner_id (full_name),
  property_images (storage_path, sort_order)`;

export async function fetchAdminListings(
	supabase: SupabaseClient,
	options: {
		approvalStatus: 'pending' | 'other';
		page: number;
		pageSize: number;
	}
): Promise<{ listings: AdminListing[]; total: number; error: string | null }> {
	const { from, to } = pageRange(options.page, options.pageSize);

	let query = supabase
		.from('properties')
		.select(ADMIN_LISTING_SELECT, { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to);

	if (options.approvalStatus === 'pending') {
		query = query.eq('approval_status', 'pending');
	} else {
		query = query.in('approval_status', ['approved', 'rejected']);
	}

	const { data, error, count } = await query;

	if (error) {
		console.error('fetchAdminListings failed:', error.message);
		return { listings: [], total: 0, error: error.message };
	}

	const listings = (data ?? []).map((row) => {
		const owner = row.owner as { full_name: string } | { full_name: string }[] | null;
		const ownerName = Array.isArray(owner) ? owner[0]?.full_name : owner?.full_name;

		return toAdminListing({
			...row,
			owner: ownerName ? { full_name: ownerName } : null
		} as DbAdminProperty);
	});

	return {
		listings,
		total: count ?? 0,
		error: null
	};
}
