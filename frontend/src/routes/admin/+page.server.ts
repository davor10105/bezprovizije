import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';
import { ADMIN_PAGE_SIZE, pageRange, parsePageParam, totalPages } from '$lib/pagination';
import type { UserRole } from '$lib/types/auth';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const page = parsePageParam(url.searchParams.get('page'));
	const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);

	const { data: users, error, count } = await supabase
		.from('profiles')
		.select('id, full_name, phone, role, bp_balance, created_at', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to);

	if (error) {
		return {
			users: [],
			error: error.message,
			pagination: { page, pageSize: ADMIN_PAGE_SIZE, total: 0, totalPages: 1 }
		};
	}

	const total = count ?? 0;

	return {
		users: users ?? [],
		error: null,
		pagination: {
			page,
			pageSize: ADMIN_PAGE_SIZE,
			total,
			totalPages: totalPages(total, ADMIN_PAGE_SIZE)
		}
	};
};

export const actions: Actions = {
	setRole: async ({ request, locals: { supabase } }) => {
		const { user } = await requireAdmin(supabase);
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const role = formData.get('role') as UserRole;

		if (!id || (role !== 'admin' && role !== 'user')) {
			return fail(400, { message: 'Neispravan zahtjev.' });
		}

		if (id === user.id && role === 'user') {
			return fail(400, { message: 'Ne možete sami sebi ukloniti administratorsku ulogu.' });
		}

		const { error } = await supabase.from('profiles').update({ role }).eq('id', id);

		if (error) return fail(500, { message: error.message });
		return { success: true };
	},

	adjustBp: async ({ request, locals: { supabase } }) => {
		await requireAdmin(supabase);
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const direction = formData.get('direction') as string;
		const magnitude = Number(formData.get('magnitude'));

		if (!id || !Number.isInteger(magnitude) || magnitude <= 0) {
			return fail(400, { message: 'Unesite ispravan broj BP tokena (veći od nule).' });
		}

		if (direction !== 'add' && direction !== 'remove') {
			return fail(400, { message: 'Neispravan zahtjev.' });
		}

		const amount = direction === 'remove' ? -magnitude : magnitude;

		const { data: ok, error } = await supabase.rpc(
			'admin_adjust_bp' as never,
			{ p_user_id: id, p_amount: amount } as never
		);

		if (error) return fail(500, { message: error.message });
		if (!ok) {
			return fail(400, {
				message: 'Promjena BP stanja nije uspjela. Stanje ne može biti negativno.'
			});
		}

		return { success: true };
	}
};
