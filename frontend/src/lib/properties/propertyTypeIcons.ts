/**
 * Custom property type icons (SVG).
 *
 * Place one SVG per property type in:
 *   frontend/src/lib/assets/property-types/
 *
 * File names must match the property type key:
 *   apartment.svg, house.svg, business.svg, garage.svg, room.svg, land.svg
 *
 * For highlight-color tinting, use stroke="currentColor" and/or fill="currentColor"
 * in your SVG (avoid hard-coded hex colors). The UI sets text-yellow-500 on the wrapper.
 *
 * After replacing a file, restart the dev server if the icon does not update immediately.
 */
import type { PropertyType } from '$lib/types/property';
import apartment from '$lib/assets/property-types/apartment.svg?raw';
import house from '$lib/assets/property-types/house.svg?raw';
import business from '$lib/assets/property-types/business.svg?raw';
import garage from '$lib/assets/property-types/garage.svg?raw';
import room from '$lib/assets/property-types/room.svg?raw';
import land from '$lib/assets/property-types/land.svg?raw';

export const PROPERTY_TYPE_ICON_SVG: Record<PropertyType, string> = {
	apartment,
	house,
	business,
	garage,
	room,
	land
};
