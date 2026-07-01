import { redirect } from '@sveltejs/kit';

export function GET() {
  throw redirect(302, `http://localhost:8000/login/google`);
}