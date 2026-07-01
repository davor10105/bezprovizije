export type ListingType = 'sale' | 'rent';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type PropertyType = 'apartment' | 'house' | 'business' | 'garage' | 'room';

export type Property = {
	id: string;
	owner_id: string;
	title: string;
	description: string;
	listing_type: ListingType;
	price: number;
	sqm: number;
	property_type: PropertyType;
	address: string;
	lat: number;
	lng: number;
	county: string | null;
	city: string | null;
	neighborhood: string | null;
	rooms: number | null;
	bathrooms: number | null;
	build_year: number | null;
	parking_spaces: number | null;
	attributes: Record<string, string | number | boolean>;
	is_published: boolean;
	approval_status: ApprovalStatus;
	created_at: string;
	updated_at: string;
};

export type PropertyImage = {
	id: string;
	property_id: string;
	storage_path: string;
	sort_order: number;
};

export type GeocodeResult = {
	id: string;
	display_name: string;
	short_name: string;
	lat: number;
	lng: number;
};
