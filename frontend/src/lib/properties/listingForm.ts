import type { ListingType, PropertyType } from '$lib/types/property';
import {
	ATTRIBUTE_FIELDS_BY_TYPE,
	CORE_OPTIONAL_FIELDS,
	LISTING_TYPES,
	PROPERTY_TYPES
} from '$lib/properties/schema';

const MAX_IMAGES = 12;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ListingFormPayload = {
	property_type: PropertyType;
	listing_type: ListingType;
	address: string;
	lat: number;
	lng: number;
	title: string;
	description: string;
	price: number;
	sqm: number;
	rooms: number | null;
	bathrooms: number | null;
	build_year: number | null;
	parking_spaces: number | null;
	attributes: Record<string, string | number | boolean>;
};

export function parseListingForm(
	formData: FormData,
	options: { imagesRequired?: boolean } = {}
): {
	payload?: ListingFormPayload;
	images: File[];
	errors: Record<string, string>;
} {
	const errors: Record<string, string> = {};

	const property_type = formData.get('property_type') as PropertyType;
	const listing_type = formData.get('listing_type') as ListingType;

	if (!PROPERTY_TYPES.includes(property_type)) {
		errors.property_type = 'Odaberite vrstu nekretnine.';
	}
	if (!LISTING_TYPES.includes(listing_type)) {
		errors.listing_type = 'Odaberite prodaju ili najam.';
	}

	const address = (formData.get('address') as string)?.trim();
	const lat = Number(formData.get('lat'));
	const lng = Number(formData.get('lng'));

	if (!address || address.length < 5) {
		errors.address = 'Unesite adresu nekretnine.';
	}
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
		errors.location = 'Označite lokaciju na karti ili odaberite adresu iz prijedloga.';
	}

	const title = (formData.get('title') as string)?.trim();
	const description = (formData.get('description') as string)?.trim();
	const price = Number(formData.get('price'));
	const sqm = Number(formData.get('sqm'));

	if (!title || title.length < 5) {
		errors.title = 'Naslov mora imati najmanje 5 znakova.';
	}
	if (!description || description.length < 20) {
		errors.description = 'Opis mora imati najmanje 20 znakova.';
	}
	if (!Number.isFinite(price) || price <= 0) {
		errors.price = 'Unesite ispravnu cijenu.';
	}
	if (!Number.isFinite(sqm) || sqm <= 0) {
		errors.sqm = 'Unesite ispravnu površinu u m².';
	}

	const parseOptionalInt = (name: string) => {
		const raw = (formData.get(name) as string)?.trim();
		if (!raw) return null;
		const value = Number(raw);
		return Number.isFinite(value) ? Math.round(value) : null;
	};

	const rooms = parseOptionalInt('rooms');
	const bathrooms = parseOptionalInt('bathrooms');
	const build_year = parseOptionalInt('build_year');
	const parking_spaces = parseOptionalInt('parking_spaces');

	const coreFields = property_type ? CORE_OPTIONAL_FIELDS[property_type] : null;
	if (coreFields?.rooms && rooms !== null && rooms < 0) errors.rooms = 'Neispravan broj soba.';
	if (coreFields?.bathrooms && bathrooms !== null && bathrooms < 0) {
		errors.bathrooms = 'Neispravan broj kupaonica.';
	}
	if (coreFields?.build_year && build_year !== null && (build_year < 1800 || build_year > 2100)) {
		errors.build_year = 'Neispravna godina gradnje.';
	}

	const attributes: Record<string, string | number | boolean> = {};
	const typeFields = property_type ? ATTRIBUTE_FIELDS_BY_TYPE[property_type] : [];

	for (const field of typeFields) {
		const raw = formData.get(`attr_${field.key}`);
		if (raw === null || raw === '') continue;

		if (field.type === 'boolean') {
			attributes[field.key] = raw === 'true' || raw === 'on';
		} else if (field.type === 'number') {
			const num = Number(raw);
			if (Number.isFinite(num)) attributes[field.key] = num;
		} else {
			attributes[field.key] = String(raw).trim();
		}
	}

	const imagesRequired = options.imagesRequired ?? true;

	const images = formData
		.getAll('images')
		.filter((file): file is File => file instanceof File && file.size > 0);

	if (imagesRequired && images.length === 0) {
		errors.images = 'Dodajte barem jednu fotografiju.';
	}
	if (images.length > MAX_IMAGES) {
		errors.images = `Maksimalno ${MAX_IMAGES} fotografija.`;
	}
	for (const image of images) {
		if (!image.type.startsWith('image/')) {
			errors.images = 'Dozvoljene su samo slikovne datoteke.';
			break;
		}
		if (image.size > MAX_IMAGE_BYTES) {
			errors.images = 'Svaka fotografija može imati najviše 5 MB.';
			break;
		}
	}

	if (Object.keys(errors).length > 0 || !property_type || !listing_type) {
		return { errors, images };
	}

	return {
		payload: {
			property_type,
			listing_type,
			address,
			lat,
			lng,
			title,
			description,
			price,
			sqm,
			rooms: coreFields?.rooms ? rooms : null,
			bathrooms: coreFields?.bathrooms ? bathrooms : null,
			build_year: coreFields?.build_year ? build_year : null,
			parking_spaces: coreFields?.parking_spaces ? parking_spaces : null,
			attributes
		},
		images,
		errors
	};
}
