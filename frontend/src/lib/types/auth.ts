export type UserRole = 'user' | 'admin';

export type Profile = {
	id: string;
	full_name: string;
	phone: string;
	role: UserRole;
	created_at: string;
	updated_at: string;
};
