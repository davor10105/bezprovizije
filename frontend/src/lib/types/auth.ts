export type UserRole = 'user' | 'admin';

export type Profile = {
	id: string;
	full_name: string;
	phone: string;
	email: string | null;
	role: UserRole;
	bp_balance: number;
	created_at: string;
	updated_at: string;
};
