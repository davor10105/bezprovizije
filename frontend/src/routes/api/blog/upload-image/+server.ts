import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProfile, getSafeUser, isAdmin } from '$lib/auth';
import { getBlogImageUrl } from '$lib/blog/utils';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	const { user } = await getSafeUser(supabase);

	if (!user) {
		return json({ error: 'Potrebna je prijava.' }, { status: 401 });
	}

	const profile = await getProfile(supabase, user.id);

	if (!isAdmin(profile)) {
		return json({ error: 'Nemate ovlasti.' }, { status: 403 });
	}
	const formData = await request.formData();
	const image = formData.get('image');

	if (!(image instanceof File) || image.size === 0) {
		return json({ error: 'Odaberite sliku.' }, { status: 400 });
	}

	if (!ALLOWED_TYPES.has(image.type)) {
		return json({ error: 'Dozvoljeni formati: JPEG, PNG, WebP, GIF.' }, { status: 400 });
	}

	if (image.size > MAX_SIZE) {
		return json({ error: 'Slika može imati najviše 5 MB.' }, { status: 400 });
	}

	const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg';
	const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

	const { error: uploadError } = await supabase.storage
		.from('blog-images')
		.upload(storagePath, image, { contentType: image.type, upsert: false });

	if (uploadError) {
		console.error('Blog image upload failed:', uploadError.message);
		return json({ error: 'Učitavanje slike nije uspjelo.' }, { status: 500 });
	}

	return json({ url: getBlogImageUrl(storagePath), storagePath });
};
