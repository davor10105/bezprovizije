import { redirect } from '@sveltejs/kit';
import type { AuthError, User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';
import type { Profile, UserRole } from '$lib/types/auth';

function isInvalidSessionError(error: AuthError | Error): boolean {
	const message = error.message?.toLowerCase() ?? '';
	return (
		message.includes('refresh token') ||
		message.includes('invalid jwt') ||
		message.includes('session not found') ||
		('code' in error && error.code === 'refresh_token_not_found')
	);
}

export function clearAuthCookies(cookies: Cookies) {
	for (const { name } of cookies.getAll()) {
		if (name.startsWith('sb-') && name.includes('auth')) {
			cookies.delete(name, { path: '/' });
		}
	}
}

function clearBrowserAuthStorage() {
	if (typeof window === 'undefined') return;

	for (const key of Object.keys(localStorage)) {
		if (key.startsWith('sb-') && key.includes('auth')) {
			localStorage.removeItem(key);
		}
	}

	for (const key of Object.keys(sessionStorage)) {
		if (key.startsWith('sb-') && key.includes('auth')) {
			sessionStorage.removeItem(key);
		}
	}
}

export async function clearAuthSession(supabase: SupabaseClient, cookies?: Cookies) {
	try {
		await supabase.auth.signOut({ scope: 'local' });
	} catch {
		// Session is already invalid — local cleanup below is enough.
	}

	if (cookies) {
		clearAuthCookies(cookies);
	}

	clearBrowserAuthStorage();
}

/** Returns the authenticated user, clearing stale cookies on invalid sessions. */
export async function getSafeUser(
	supabase: SupabaseClient,
	cookies?: Cookies
): Promise<{ user: User | null; error: AuthError | Error | null }> {
	try {
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();

		if (error) {
			if (isInvalidSessionError(error)) {
				await clearAuthSession(supabase, cookies);
			}
			return { user: null, error };
		}

		return { user, error: null };
	} catch (error) {
		if (error instanceof Error && isInvalidSessionError(error)) {
			await clearAuthSession(supabase, cookies);
		}
		return { user: null, error: error instanceof Error ? error : new Error(String(error)) };
	}
}

export async function getSafeClaims(
	supabase: SupabaseClient,
	cookies?: Cookies
): Promise<Record<string, unknown> | null> {
	try {
		const { data, error } = await supabase.auth.getClaims();

		if (error) {
			if (isInvalidSessionError(error)) {
				await clearAuthSession(supabase, cookies);
			}
			return null;
		}

		return (data?.claims as Record<string, unknown> | undefined) ?? null;
	} catch (error) {
		if (error instanceof Error && isInvalidSessionError(error)) {
			await clearAuthSession(supabase, cookies);
		}
		return null;
	}
}

export function hasAuthCookies(cookies: Cookies): boolean {
	return cookies.getAll().some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth'));
}

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
	const { user } = await getSafeUser(supabase);

	if (!user) {
		redirect(303, redirectTo);
	}

	const profile = await getProfile(supabase, user.id);

	return { user, profile };
}

export async function requireCompleteProfile(
	supabase: SupabaseClient,
	redirectTo = '/account'
) {
	const { user, profile } = await requireAuth(supabase);

	if (!isProfileComplete(profile)) {
		redirect(303, `${redirectTo}?setup=1`);
	}

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
