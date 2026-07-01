import { redirect } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, UserRole } from '$lib/types/auth';

export async function getProfile(
	supabase: SupabaseClient,
	userId: string
): Promise<Profile | null> {
	const { data, error } = await supabase
		.from('profiles')
		.select('id, full_name, phone, role, created_at, updated_at')
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error('getProfile failed:', error.message);
		return null;
	}

	return data as Profile | null;
}

export async function saveProfile(
	supabase: SupabaseClient,
	userId: string,
	{ full_name, phone }: { full_name: string; phone: string }
) {
	return supabase.from('profiles').upsert(
		{ id: userId, full_name, phone },
		{ onConflict: 'id' }
	);
}

export function isAdmin(profile: Profile | null): boolean {
	return profile?.role === 'admin';
}

export function hasRole(profile: Profile | null, role: UserRole): boolean {
	return profile?.role === role;
}

export function isProfileComplete(profile: Profile | null): boolean {
	if (!profile) return false;
	return profile.full_name.trim().length >= 2 && profile.phone.trim().length > 0;
}

export async function requireAuth(supabase: SupabaseClient, redirectTo = '/prijava?action=login') {
	const {
		data: { user },
		error
	} = await supabase.auth.getUser();

	if (error || !user) {
		redirect(303, redirectTo);
	}

	const profile = await getProfile(supabase, user.id);

	return { user, profile };
}

export async function requireAdmin(supabase: SupabaseClient) {
	const { user, profile } = await requireAuth(supabase);

	if (!isAdmin(profile)) {
		redirect(303, '/');
	}

	return { user, profile };
}

const EMAIL_PATTERN = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,}$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_PATTERN.test(email);
}

const PHONE_PATTERN = /^\+?[\d\s\-()]{8,20}$/;

export function isValidPhone(phone: string): boolean {
	return PHONE_PATTERN.test(phone.trim());
}
