export const IMAGE_ORDER_EXISTING_PREFIX = 'e:';
export const IMAGE_ORDER_NEW = 'n';

export function existingImageOrderToken(id: string): string {
	return `${IMAGE_ORDER_EXISTING_PREFIX}${id}`;
}

export function parseImageOrderTokens(formData: FormData): string[] {
	return formData.getAll('image_order').map(String).filter(Boolean);
}

export function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
	if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length) {
		return items;
	}

	const next = [...items];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	return next;
}

export function compareImageSortOrder(
	a: { sort_order: number; storage_path: string },
	b: { sort_order: number; storage_path: string }
): number {
	return a.sort_order - b.sort_order || a.storage_path.localeCompare(b.storage_path);
}
