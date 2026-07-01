import { slugify } from '$lib/blog/utils';

export type BlogFormPayload = {
	title: string;
	description: string;
	content: string;
};

export function parseBlogForm(formData: FormData): {
	payload: BlogFormPayload | null;
	errors: Record<string, string>;
} {
	const title = String(formData.get('title') ?? '').trim();
	const description = String(formData.get('description') ?? '').trim();
	const content = String(formData.get('content') ?? '').trim();

	const errors: Record<string, string> = {};

	if (title.length < 3) {
		errors.title = 'Naslov mora imati najmanje 3 znaka.';
	} else if (!slugify(title)) {
		errors.title = 'Naslov mora sadržavati barem jedno slovo ili broj.';
	}

	if (description.length < 10) {
		errors.description = 'Kratki opis mora imati najmanje 10 znakova.';
	}

	if (description.length > 500) {
		errors.description = 'Kratki opis može imati najviše 500 znakova.';
	}

	if (content.length < 10) {
		errors.content = 'Sadržaj mora imati najmanje 10 znakova.';
	}

	if (Object.keys(errors).length > 0) {
		return { payload: null, errors };
	}

	return {
		payload: { title, description, content },
		errors
	};
}
