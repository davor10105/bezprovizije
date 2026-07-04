import type { ListingType, PropertyType } from '$lib/types/property';

export type AttributeFieldType = 'number' | 'select' | 'boolean' | 'text';

export type AttributeCategory = {
	key: string;
	label: string;
};

export type AttributeField = {
	key: string;
	label: string;
	type: AttributeFieldType;
	options?: string[];
	min?: number;
	max?: number;
	placeholder?: string;
	searchable?: boolean;
	required?: boolean;
	category?: string;
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
	{ label: string; description: string; listingTypesOnly?: ListingType[] }
> = {
	apartment: { label: 'Stan', description: 'Stanovi i apartmani' },
	house: { label: 'Kuća', description: 'Obiteljske kuće i vile' },
	business: { label: 'Poslovni prostor', description: 'Uredi, trgovine, hale' },
	garage: { label: 'Garaža', description: 'Garažna i parkirna mjesta' },
	room: { label: 'Soba', description: 'Sobe za najam', listingTypesOnly: ['rent'] },
	land: { label: 'Zemljište', description: 'Poljoprivredna i građevinska čestica' }
};

/** Croatian display labels stored in DB enum maps to legacy search filter labels */
export const PROPERTY_TYPE_SEARCH_LABELS: Record<PropertyType, string> = {
	apartment: 'Stan',
	house: 'Kuća',
	business: 'Poslovni',
	garage: 'Garaža',
	room: 'Soba',
	land: 'Zemljište'
};

const ENERGY_CLASS_OPTIONS = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const ATTRIBUTE_CATEGORIES_BY_TYPE: Partial<Record<PropertyType, AttributeCategory[]>> = {
	house: [
		{ key: 'basic', label: 'Osnovno' },
		{ key: 'basic_features', label: 'Osnovne značajke' },
		{ key: 'heating', label: 'Sustav grijanja i dodatne karakteristike' },
		{ key: 'bathroom', label: 'Kupaonica' },
		{ key: 'security', label: 'Sigurnost' },
		{ key: 'outdoor_living', label: 'Balkon / lođa / terasa' },
		{ key: 'structures', label: 'Ostali objekti i površine' },
		{ key: 'parking', label: 'Vrsta parkinga' },
		{ key: 'utilities', label: 'Ostalo' }
	],
	apartment: [
		{ key: 'basic', label: 'Osnovno' },
		{ key: 'basic_features', label: 'Osnovne značajke' },
		{ key: 'heating', label: 'Sustav grijanja i dodatne karakteristike' },
		{ key: 'bathroom', label: 'Kupaonica' },
		{ key: 'security', label: 'Sigurnost' },
		{ key: 'outdoor_living', label: 'Balkon / lođa / terasa' },
		{ key: 'structures', label: 'Ostalo u zgradi' },
		{ key: 'parking', label: 'Vrsta parkinga' },
		{ key: 'utilities', label: 'Ostalo' }
	],
	land: [
		{ key: 'basic', label: 'Osnovno' },
		{ key: 'infrastructure', label: 'Infrastruktura na čestici' }
	],
	business: [
		{ key: 'basic', label: 'Osnovno' },
		{ key: 'space_equipment', label: 'Opremanje prostora' },
		{ key: 'commercial_equipment', label: 'Poslovna oprema' },
		{ key: 'heating', label: 'Grijanje i energetika' }
	]
};

const HOUSE_FIELDS: AttributeField[] = [
	// Osnovno
	{
		key: 'build_type',
		label: 'Tip gradnje',
		type: 'select',
		options: ['Samostojeća', 'U nizu', 'Dvojna', 'Vila', 'Montažna', 'Drvena'],
		searchable: true,
		category: 'basic'
	},
	{
		key: 'furnished',
		label: 'Namještenost',
		type: 'select',
		options: ['Potpuno namješteno', 'Polunamješteno', 'Nenamješteno'],
		searchable: true,
		category: 'basic'
	},
	{
		key: 'floors',
		label: 'Broj etaža kuće',
		type: 'number',
		min: 1,
		max: 10,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'bathrooms_with_toilet',
		label: 'Broj kupaonica s WC-om',
		type: 'number',
		min: 0,
		max: 20,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'bathrooms_without_toilet',
		label: 'Broj kupaonica bez WC-a',
		type: 'number',
		min: 0,
		max: 20,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'toilets',
		label: 'Broj WC-a',
		type: 'number',
		min: 0,
		max: 20,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'garden_sqm',
		label: 'Površina okućnice (m²)',
		type: 'number',
		min: 0,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'plot_sqm',
		label: 'Površina parcele (m²)',
		type: 'number',
		min: 0,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'last_renovation_year',
		label: 'Godina zadnje renovacije',
		type: 'number',
		min: 1800,
		max: 2100,
		searchable: true,
		category: 'basic'
	},
	// Osnovne značajke
	{
		key: 'new_build',
		label: 'Novogradnja',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'wheelchair_access',
		label: 'Pristup za osobe s invaliditetom',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'city_sewage',
		label: 'Gradska kanalizacija',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'workers_accommodation',
		label: 'Smještaj pogodan za radnike',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'city_gas',
		label: 'Gradski plin',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'video_tour',
		label: 'Razgledavanje videopozivom',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'elevator',
		label: 'Lift',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'city_water',
		label: 'Gradski vodovod',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'pets_allowed',
		label: 'Ljubimci dozvoljeni',
		type: 'boolean',
		searchable: true,
		listingTypes: ['rent'],
		category: 'basic_features'
	},
	// Grijanje
	{
		key: 'heating_system',
		label: 'Sustav grijanja',
		type: 'select',
		options: [
			'Gradski plin',
			'Plinski kotao',
			'Dizalica topline',
			'Električno',
			'Peć na drva/pellets',
			'Uložak',
			'Solarno',
			'Nema'
		],
		searchable: true,
		category: 'heating'
	},
	{
		key: 'energy_class',
		label: 'Energetski razred',
		type: 'select',
		options: ENERGY_CLASS_OPTIONS,
		searchable: true,
		category: 'heating'
	},
	{
		key: 'ac',
		label: 'Klima-uređaj',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	{
		key: 'underfloor_heating',
		label: 'Podno grijanje',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	{
		key: 'wall_heating',
		label: 'Zidno grijanje',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	{
		key: 'fireplace',
		label: 'Kamin',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	{
		key: 'solar_panels',
		label: 'Solarni paneli',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	// Kupaonica
	{ key: 'shower', label: 'Tuš-kabina', type: 'boolean', searchable: true, category: 'bathroom' },
	{ key: 'bathtub', label: 'Kada', type: 'boolean', searchable: true, category: 'bathroom' },
	{ key: 'jacuzzi', label: 'Jacuzzi', type: 'boolean', searchable: true, category: 'bathroom' },
	{ key: 'sauna', label: 'Sauna', type: 'boolean', searchable: true, category: 'bathroom' },
	// Sigurnost
	{
		key: 'alarm_system',
		label: 'Alarmni sustav',
		type: 'boolean',
		searchable: true,
		category: 'security'
	},
	{
		key: 'video_intercom',
		label: 'Video portafon',
		type: 'boolean',
		searchable: true,
		category: 'security'
	},
	{
		key: 'security_doors',
		label: 'Protuprovalna vrata',
		type: 'boolean',
		searchable: true,
		category: 'security'
	},
	// Balkon / lođa / terasa
	{ key: 'balcony', label: 'Balkon', type: 'boolean', searchable: true, category: 'outdoor_living' },
	{ key: 'loggia', label: 'Lođa', type: 'boolean', searchable: true, category: 'outdoor_living' },
	{ key: 'terrace', label: 'Terasa', type: 'boolean', searchable: true, category: 'outdoor_living' },
	// Ostali objekti
	{
		key: 'yard_garden',
		label: 'Dvorište/vrt',
		type: 'boolean',
		searchable: true,
		category: 'structures'
	},
	{
		key: 'storage_shed',
		label: 'Spremište/šupa',
		type: 'boolean',
		searchable: true,
		category: 'structures'
	},
	{
		key: 'garden_house',
		label: 'Vrtna kućica',
		type: 'boolean',
		searchable: true,
		category: 'structures'
	},
	{
		key: 'winter_garden',
		label: 'Zimski vrt',
		type: 'boolean',
		searchable: true,
		category: 'structures'
	},
	{ key: 'pool', label: 'Bazen', type: 'boolean', searchable: true, category: 'structures' },
	{ key: 'barbecue', label: 'Roštilj', type: 'boolean', searchable: true, category: 'structures' },
	{ key: 'basement', label: 'Podrum', type: 'boolean', searchable: true, category: 'structures' },
	// Parking
	{ key: 'garage', label: 'Garaža', type: 'boolean', searchable: true, category: 'parking' },
	{
		key: 'garage_space',
		label: 'Garažno mjesto',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'covered_parking',
		label: 'Vanjsko natkriveno mjesto',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'uncovered_parking',
		label: 'Vanjsko nenatkriveno mjesto',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'free_public_parking',
		label: 'Besplatni javni parking',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'paid_public_parking',
		label: 'Naplatni javni parking',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	// Ostalo
	{ key: 'cable_tv', label: 'Kabelska televizija', type: 'boolean', searchable: true, category: 'utilities' },
	{
		key: 'satellite_tv',
		label: 'Satelitska televizija',
		type: 'boolean',
		searchable: true,
		category: 'utilities'
	},
	{ key: 'internet', label: 'Internet konekcija', type: 'boolean', searchable: true, category: 'utilities' },
	{
		key: 'telephone_line',
		label: 'Telefonska linija',
		type: 'boolean',
		searchable: true,
		category: 'utilities'
	}
];

/** Apartment optional fields — subset of the house schema plus floor/total_floors. */
const APARTMENT_FIELDS: AttributeField[] = [
	// Osnovno
	{
		key: 'build_type',
		label: 'Tip stana',
		type: 'select',
		options: [
			'U stambenoj zgradi',
			'U stambeno-poslovnoj zgradi',
			'Dupleks',
			'Penthouse',
			'U vili',
			'Garsonijera/studio'
		],
		searchable: true,
		category: 'basic'
	},
	{
		key: 'furnished',
		label: 'Namještenost',
		type: 'select',
		options: ['Potpuno namješteno', 'Polunamješteno', 'Nenamješteno'],
		searchable: true,
		category: 'basic'
	},
	{
		key: 'floor',
		label: 'Kat',
		type: 'number',
		min: 0,
		max: 100,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'total_floors',
		label: 'Ukupno katova u zgradi',
		type: 'number',
		min: 1,
		max: 100,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'bathrooms_with_toilet',
		label: 'Broj kupaonica s WC-om',
		type: 'number',
		min: 0,
		max: 10,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'bathrooms_without_toilet',
		label: 'Broj kupaonica bez WC-a',
		type: 'number',
		min: 0,
		max: 10,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'toilets',
		label: 'Broj WC-a',
		type: 'number',
		min: 0,
		max: 10,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'last_renovation_year',
		label: 'Godina zadnje renovacije',
		type: 'number',
		min: 1800,
		max: 2100,
		searchable: true,
		category: 'basic'
	},
	// Osnovne značajke
	{
		key: 'new_build',
		label: 'Novogradnja',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'wheelchair_access',
		label: 'Pristup za osobe s invaliditetom',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'city_sewage',
		label: 'Gradska kanalizacija',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'workers_accommodation',
		label: 'Smještaj pogodan za radnike',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'city_gas',
		label: 'Gradski plin',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'video_tour',
		label: 'Razgledavanje videopozivom',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'elevator',
		label: 'Lift',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'city_water',
		label: 'Gradski vodovod',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'no_agency_fee',
		label: 'Bez agencijske provizije',
		type: 'boolean',
		searchable: true,
		category: 'basic_features'
	},
	{
		key: 'pets_allowed',
		label: 'Ljubimci dozvoljeni',
		type: 'boolean',
		searchable: true,
		listingTypes: ['rent'],
		category: 'basic_features'
	},
	// Grijanje
	{
		key: 'heating_system',
		label: 'Sustav grijanja',
		type: 'select',
		options: [
			'Gradski plin',
			'Plinsko etažno',
			'Dizalica topline',
			'Električno',
			'Uložak',
			'Klima',
			'Nema'
		],
		searchable: true,
		category: 'heating'
	},
	{
		key: 'energy_class',
		label: 'Energetski razred',
		type: 'select',
		options: ENERGY_CLASS_OPTIONS,
		searchable: true,
		category: 'heating'
	},
	{
		key: 'ac',
		label: 'Klima-uređaj',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	{
		key: 'underfloor_heating',
		label: 'Podno grijanje',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	{
		key: 'wall_heating',
		label: 'Zidno grijanje',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	{
		key: 'solar_panels',
		label: 'Solarni paneli',
		type: 'boolean',
		searchable: true,
		category: 'heating'
	},
	// Kupaonica
	{ key: 'shower', label: 'Tuš-kabina', type: 'boolean', searchable: true, category: 'bathroom' },
	{ key: 'bathtub', label: 'Kada', type: 'boolean', searchable: true, category: 'bathroom' },
	{ key: 'jacuzzi', label: 'Jacuzzi', type: 'boolean', searchable: true, category: 'bathroom' },
	{ key: 'sauna', label: 'Sauna', type: 'boolean', searchable: true, category: 'bathroom' },
	// Sigurnost
	{
		key: 'alarm_system',
		label: 'Alarmni sustav',
		type: 'boolean',
		searchable: true,
		category: 'security'
	},
	{
		key: 'video_intercom',
		label: 'Video portafon',
		type: 'boolean',
		searchable: true,
		category: 'security'
	},
	{
		key: 'security_doors',
		label: 'Protuprovalna vrata',
		type: 'boolean',
		searchable: true,
		category: 'security'
	},
	// Balkon / lođa / terasa
	{ key: 'balcony', label: 'Balkon', type: 'boolean', searchable: true, category: 'outdoor_living' },
	{ key: 'loggia', label: 'Lođa', type: 'boolean', searchable: true, category: 'outdoor_living' },
	{ key: 'terrace', label: 'Terasa', type: 'boolean', searchable: true, category: 'outdoor_living' },
	// Ostalo u zgradi
	{ key: 'basement', label: 'Podrum/spremište', type: 'boolean', searchable: true, category: 'structures' },
	{
		key: 'winter_garden',
		label: 'Zimski vrt',
		type: 'boolean',
		searchable: true,
		category: 'structures'
	},
	// Parking
	{ key: 'garage', label: 'Garaža', type: 'boolean', searchable: true, category: 'parking' },
	{
		key: 'garage_space',
		label: 'Garažno mjesto',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'covered_parking',
		label: 'Vanjsko natkriveno mjesto',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'uncovered_parking',
		label: 'Vanjsko nenatkriveno mjesto',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'free_public_parking',
		label: 'Besplatni javni parking',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	{
		key: 'paid_public_parking',
		label: 'Naplatni javni parking',
		type: 'boolean',
		searchable: true,
		category: 'parking'
	},
	// Ostalo
	{ key: 'cable_tv', label: 'Kabelska televizija', type: 'boolean', searchable: true, category: 'utilities' },
	{
		key: 'satellite_tv',
		label: 'Satelitska televizija',
		type: 'boolean',
		searchable: true,
		category: 'utilities'
	},
	{ key: 'internet', label: 'Internet konekcija', type: 'boolean', searchable: true, category: 'utilities' },
	{
		key: 'telephone_line',
		label: 'Telefonska linija',
		type: 'boolean',
		searchable: true,
		category: 'utilities'
	}
];

const BUSINESS_FIELDS: AttributeField[] = [
	{
		key: 'commercial_space_purpose',
		label: 'Namjena prostora',
		type: 'select',
		options: [
			'Trgovina',
			'Uslužna djelatnost',
			'Uredski',
			'Ulični lokal',
			'Ugostiteljski',
			'Skladišni/radiona'
		],
		searchable: true,
		required: true,
		category: 'basic'
	},
	{
		key: 'commercial_space_position',
		label: 'Položaj prostora',
		type: 'select',
		options: ['Ulični lokal', 'U zgradi', 'U kući', 'U dvorištu'],
		searchable: true,
		category: 'basic'
	},
	{
		key: 'reserved_parking_spaces',
		label: 'Rezervirana parkirna mjesta',
		type: 'select',
		options: ['1', '2', '3', '4', '5', '6', '7', '8+'],
		searchable: true,
		category: 'basic'
	},
	{
		key: 'floor',
		label: 'Kat',
		type: 'number',
		min: 0,
		max: 100,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'office_count',
		label: 'Broj ureda/prostorija',
		type: 'number',
		min: 0,
		max: 100,
		searchable: true,
		category: 'basic'
	},
	{
		key: 'property_condition',
		label: 'Stanje nekretnine',
		type: 'select',
		options: ['Novogradnja', 'Za adaptaciju', 'Odlično', 'Renovirano', 'Dobro'],
		searchable: true,
		category: 'basic'
	},
	{
		key: 'telephone_line',
		label: 'Telefonska linija',
		type: 'boolean',
		searchable: true,
		category: 'space_equipment'
	},
	{
		key: 'city_sewage',
		label: 'Gradska kanalizacija',
		type: 'boolean',
		searchable: true,
		category: 'space_equipment'
	},
	{
		key: 'city_gas',
		label: 'Gradski plin',
		type: 'boolean',
		searchable: true,
		category: 'space_equipment'
	},
	{
		key: 'city_water',
		label: 'Gradski vodovod',
		type: 'boolean',
		searchable: true,
		category: 'space_equipment'
	},
	{
		key: 'elevator',
		label: 'Lift',
		type: 'boolean',
		searchable: true,
		category: 'space_equipment'
	},
	{
		key: 'new_build',
		label: 'Novogradnja',
		type: 'boolean',
		searchable: true,
		category: 'space_equipment'
	},
	{
		key: 'freight_elevator',
		label: 'Teretni lift',
		type: 'boolean',
		searchable: true,
		category: 'space_equipment'
	},
	{
		key: 'reception',
		label: 'Recepcija',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'tea_kitchen',
		label: 'Čajna kuhinja',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'restaurant',
		label: 'Restoran',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'video_surveillance',
		label: 'Video nadzor',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'it_network',
		label: 'Informatička mreža',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'office_furniture',
		label: 'Uredski namještaj',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'open_space',
		label: 'Open space',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'loading_dock',
		label: 'Utovarna rampa',
		type: 'boolean',
		searchable: true,
		category: 'commercial_equipment'
	},
	{
		key: 'heating',
		label: 'Način grijanja',
		type: 'select',
		options: ['Klima', 'Podno', 'Struja', 'Plinsko etažno', 'Dizalica topline', 'Nema'],
		searchable: true,
		category: 'heating'
	},
	{
		key: 'energy_class',
		label: 'Energetski razred',
		type: 'select',
		options: ENERGY_CLASS_OPTIONS,
		searchable: true,
		category: 'heating'
	}
];

const LAND_FIELDS: AttributeField[] = [
	{
		key: 'land_type',
		label: 'Vrsta zemljišta',
		type: 'select',
		options: ['Poljoprivredno', 'Građevinsko'],
		searchable: true,
		required: true,
		category: 'basic'
	},
	{
		key: 'land_purpose',
		label: 'Namjena',
		type: 'select',
		options: ['Poljoprivredno', 'Stambeno', 'Ostalo'],
		searchable: true,
		required: true,
		category: 'basic'
	},
	{
		key: 'telephone_line',
		label: 'Telefonska linija',
		type: 'boolean',
		searchable: true,
		category: 'infrastructure'
	},
	{
		key: 'city_sewage',
		label: 'Gradska kanalizacija',
		type: 'boolean',
		searchable: true,
		category: 'infrastructure'
	},
	{
		key: 'city_heating',
		label: 'Gradska toplana',
		type: 'boolean',
		searchable: true,
		category: 'infrastructure'
	},
	{
		key: 'city_gas',
		label: 'Gradski plin',
		type: 'boolean',
		searchable: true,
		category: 'infrastructure'
	},
	{
		key: 'city_water',
		label: 'Gradski vodovod',
		type: 'boolean',
		searchable: true,
		category: 'infrastructure'
	},
	{
		key: 'asphalt_road',
		label: 'Asfaltni put',
		type: 'boolean',
		searchable: true,
		category: 'infrastructure'
	}
];

/**
 * Keys in `attributes` jsonb are searchable via GIN index; set searchable: true
 * for fields that should appear in /pretraga filters when wired up.
 */
export const ATTRIBUTE_FIELDS_BY_TYPE: Record<PropertyType, AttributeField[]> = {
	apartment: APARTMENT_FIELDS,
	house: HOUSE_FIELDS,
	business: BUSINESS_FIELDS,
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
	],
	land: LAND_FIELDS
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
	room: { rooms: false, bathrooms: false, build_year: false, parking_spaces: false },
	land: { rooms: false, bathrooms: false, build_year: false, parking_spaces: false }
};

export const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_CONFIG) as PropertyType[];
export const LISTING_TYPES = Object.keys(LISTING_TYPE_LABELS) as ListingType[];

/** Whether a property type can be listed under the given transaction type. */
export function isPropertyTypeAllowedForListing(
	propertyType: PropertyType,
	listingType: ListingType | ''
): boolean {
	const allowed = PROPERTY_TYPE_CONFIG[propertyType].listingTypesOnly;
	if (!allowed) return true;
	if (!listingType) return true;
	return allowed.includes(listingType);
}

export function getPropertyTypesForListing(listingType?: ListingType | ''): PropertyType[] {
	return PROPERTY_TYPES.filter((type) => isPropertyTypeAllowedForListing(type, listingType ?? ''));
}

export type AttributeFieldGroup = {
	category: AttributeCategory;
	fields: AttributeField[];
};

function groupFieldsByCategory(
	fields: AttributeField[],
	categories: AttributeCategory[] | undefined
): AttributeFieldGroup[] {
	if (!fields.length) return [];

	if (!categories?.length) {
		return [{ category: { key: 'default', label: 'Dodatne značajke' }, fields }];
	}

	const byKey = new Map(categories.map((category) => [category.key, [] as AttributeField[]]));
	const uncategorized: AttributeField[] = [];

	for (const field of fields) {
		if (field.category && byKey.has(field.category)) {
			byKey.get(field.category)!.push(field);
		} else {
			uncategorized.push(field);
		}
	}

	const groups = categories
		.map((category) => ({ category, fields: byKey.get(category.key) ?? [] }))
		.filter((group) => group.fields.length > 0);

	if (uncategorized.length) {
		groups.push({
			category: { key: 'other', label: 'Ostalo' },
			fields: uncategorized
		});
	}

	return groups;
}

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

export function getAttributeFieldsGrouped(
	propertyType: PropertyType,
	listingType?: ListingType | ''
): AttributeFieldGroup[] {
	return groupFieldsByCategory(
		getAttributeFields(propertyType, listingType),
		ATTRIBUTE_CATEGORIES_BY_TYPE[propertyType]
	);
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

export function getSearchableAttributeFieldsGrouped(
	propertyType?: PropertyType | '',
	listingType?: ListingType | ''
): AttributeFieldGroup[] {
	if (!propertyType) return [];

	return getAttributeFieldsGrouped(propertyType, listingType)
		.map((group) => ({
			...group,
			fields: group.fields.filter((field) => field.searchable)
		}))
		.filter((group) => group.fields.length > 0);
}

/** Count active attribute filters within a category group. */
export function countActiveFiltersInGroup(
	group: AttributeFieldGroup,
	attributes: Record<string, string[]>
): number {
	return group.fields.reduce((count, field) => {
		const values = attributes[field.key] ?? [];
		return count + (values.filter(Boolean).length > 0 ? 1 : 0);
	}, 0);
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
