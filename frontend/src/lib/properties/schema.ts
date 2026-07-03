import type { ListingType, PropertyType } from '$lib/types/property';

export type AttributeFieldType = 'number' | 'select' | 'boolean' | 'text';

export type AttributeField = {
	key: string;
	label: string;
	type: AttributeFieldType;
	options?: string[];
	min?: number;
	max?: number;
	placeholder?: string;
	searchable?: boolean;
	/**
	 * Restrict this field to specific listing types (e.g. only for rent).
	 * Omit to make the field apply to both sale and rent.
	 */
	listingTypes?: ListingType[];
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
	sale: 'Prodaja',
	rent: 'Najam'
};

export const PROPERTY_TYPE_CONFIG: Record<
	PropertyType,
	{ label: string; description: string; icon: string }
> = {
	apartment: { label: 'Stan', description: 'Stanovi i apartmani', icon: '🏢' },
	house: { label: 'Kuća', description: 'Obiteljske kuće i vile', icon: '🏠' },
	business: { label: 'Poslovni prostor', description: 'Uredi, trgovine, hale', icon: '🏪' },
	garage: { label: 'Garaža', description: 'Garažna i parkirna mjesta', icon: '🅿️' },
	room: { label: 'Soba', description: 'Sobe za najam', icon: '🛏️' }
};

/** Croatian display labels stored in DB enum maps to legacy search filter labels */
export const PROPERTY_TYPE_SEARCH_LABELS: Record<PropertyType, string> = {
	apartment: 'Stan',
	house: 'Kuća',
	business: 'Poslovni',
	garage: 'Garaža',
	room: 'Soba'
};

const COMMON_RESIDENTIAL: AttributeField[] = [
	{
		key: 'heating',
		label: 'Način grijanja',
		type: 'select',
		options: ['Klima', 'Podno', 'Struja', 'Plinsko etažno', 'Dizalica topline'],
		searchable: true
	},
	{
		key: 'energy_class',
		label: 'Energetski razred',
		type: 'select',
		options: ['A+', 'A', 'B', 'C', 'D', 'E', 'F'],
		searchable: true
	},
	{
		key: 'property_condition',
		label: 'Stanje nekretnine',
		type: 'select',
		options: ['Novogradnja', 'Za adaptaciju', 'Odlično', 'Renovirano', 'Dobro'],
		searchable: true
	}
];

/**
 * Optional fields per property type. Extend this object to add new fields later.
 * Keys in `attributes` jsonb are searchable via GIN index; set searchable: true
 * for fields that should appear in /pretraga filters when wired up.
 */
export const ATTRIBUTE_FIELDS_BY_TYPE: Record<PropertyType, AttributeField[]> = {
	apartment: [
		{ key: 'floor', label: 'Kat', type: 'number', min: 0, max: 100, searchable: true },
		{ key: 'total_floors', label: 'Ukupno katova', type: 'number', min: 1, max: 100 },
		{ key: 'balcony', label: 'Balkon', type: 'boolean', searchable: true },
		{ key: 'elevator', label: 'Lift', type: 'boolean', searchable: true },
		{ key: 'furnished', label: 'Namješteno', type: 'boolean', searchable: true },
		{
			key: 'pets_allowed',
			label: 'Ljubimci dozvoljeni',
			type: 'boolean',
			searchable: true,
			listingTypes: ['rent']
		},
		...COMMON_RESIDENTIAL
	],
	house: [
		{ key: 'garden_sqm', label: 'Veličina vrta (m²)', type: 'number', min: 0, searchable: true },
		{ key: 'plot_sqm', label: 'Veličina parcele (m²)', type: 'number', min: 0, searchable: true },
		{ key: 'floors', label: 'Broj etaža', type: 'number', min: 1, max: 10 },
		{ key: 'pool', label: 'Bazen', type: 'boolean', searchable: true },
		{ key: 'furnished', label: 'Namješteno', type: 'boolean', searchable: true },
		{
			key: 'pets_allowed',
			label: 'Ljubimci dozvoljeni',
			type: 'boolean',
			searchable: true,
			listingTypes: ['rent']
		},
		...COMMON_RESIDENTIAL
	],
	business: [
		{ key: 'floor', label: 'Kat', type: 'number', min: 0, max: 100, searchable: true },
		{ key: 'office_count', label: 'Broj ureda/prostorija', type: 'number', min: 0, searchable: true },
		{ key: 'open_space', label: 'Open space', type: 'boolean' },
		{ key: 'loading_dock', label: 'Utovarna rampa', type: 'boolean' },
		...COMMON_RESIDENTIAL
	],
	garage: [
		{ key: 'covered', label: 'Natkriveno', type: 'boolean', searchable: true },
		{ key: 'ev_charger', label: 'EV punjač', type: 'boolean', searchable: true },
		{ key: 'remote_access', label: 'Daljinsko otvaranje', type: 'boolean' },
		{ key: 'dimensions', label: 'Dimenzije (npr. 3x6 m)', type: 'text' }
	],
	room: [
		{ key: 'floor', label: 'Kat', type: 'number', min: 0, max: 100 },
		{ key: 'furnished', label: 'Namješteno', type: 'boolean', searchable: true },
		{ key: 'shared_bathroom', label: 'Zajednička kupaonica', type: 'boolean', searchable: true },
		{ key: 'shared_kitchen', label: 'Zajednička kuhinja', type: 'boolean', searchable: true },
		{
			key: 'pets_allowed',
			label: 'Ljubimci dozvoljeni',
			type: 'boolean',
			searchable: true,
			listingTypes: ['rent']
		},
		{
			key: 'utilities_included',
			label: 'Režije uključene',
			type: 'boolean',
			searchable: true,
			listingTypes: ['rent']
		}
	]
};

/** Core optional fields shown for residential types (indexed DB columns for search) */
export const CORE_OPTIONAL_FIELDS: Record<
	PropertyType,
	{ rooms: boolean; bathrooms: boolean; build_year: boolean; parking_spaces: boolean }
> = {
	apartment: { rooms: true, bathrooms: true, build_year: true, parking_spaces: true },
	house: { rooms: true, bathrooms: true, build_year: true, parking_spaces: true },
	business: { rooms: false, bathrooms: true, build_year: true, parking_spaces: true },
	garage: { rooms: false, bathrooms: false, build_year: false, parking_spaces: false },
	room: { rooms: false, bathrooms: false, build_year: false, parking_spaces: false }
};

export const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_CONFIG) as PropertyType[];
export const LISTING_TYPES = Object.keys(LISTING_TYPE_LABELS) as ListingType[];

/**
 * Attribute fields for a property type, optionally narrowed to a listing type.
 * Used both by the listing form (/objavi-oglas, /uredi-oglas) and the search
 * filters (/pretraga) so they always share the same schema.
 */
export function getAttributeFields(
	propertyType: PropertyType,
	listingType?: ListingType | ''
): AttributeField[] {
	return ATTRIBUTE_FIELDS_BY_TYPE[propertyType].filter((field) => {
		if (!field.listingTypes || !listingType) return true;
		return field.listingTypes.includes(listingType);
	});
}

/**
 * Searchable attribute fields for the /pretraga filters. When a property type is
 * selected only that type's fields are returned; otherwise the union across all
 * types is used. A listing type further narrows type-specific fields.
 */
export function getSearchableAttributeFields(
	propertyType?: PropertyType | '',
	listingType?: ListingType | ''
): AttributeField[] {
	const types = propertyType ? [propertyType] : PROPERTY_TYPES;
	const seen = new Map<string, AttributeField>();
	for (const type of types) {
		for (const field of getAttributeFields(type, listingType)) {
			if (field.searchable) {
				seen.set(field.key, field);
			}
		}
	}
	return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label, 'hr'));
}

const ATTRIBUTE_FIELD_BY_KEY: Map<string, AttributeField> = (() => {
	const map = new Map<string, AttributeField>();
	for (const type of PROPERTY_TYPES) {
		for (const field of ATTRIBUTE_FIELDS_BY_TYPE[type]) {
			if (!map.has(field.key)) map.set(field.key, field);
		}
	}
	return map;
})();

/** Look up an attribute field definition by its key (across all property types). */
export function getAttributeFieldByKey(key: string): AttributeField | undefined {
	return ATTRIBUTE_FIELD_BY_KEY.get(key);
}

export function getPublicImageUrl(supabaseUrl: string, storagePath: string): string {
	return `${supabaseUrl}/storage/v1/object/public/property-images/${storagePath}`;
}
