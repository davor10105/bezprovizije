export const ADMIN_PAGE_SIZE = 20;

export function parsePageParam(value: string | null, defaultPage = 1): number {
	const page = Number(value);
	if (!Number.isFinite(page) || page < 1) return defaultPage;
	return Math.floor(page);
}

export function pageRange(page: number, pageSize: number): { from: number; to: number } {
	const from = (page - 1) * pageSize;
	return { from, to: from + pageSize - 1 };
}

export function totalPages(total: number, pageSize: number): number {
	if (total === 0) return 1;
	return Math.ceil(total / pageSize);
}
