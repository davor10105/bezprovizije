import type { SupabaseClient } from '@supabase/supabase-js'
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare module '$env/static/private' {
	export const STRIPE_SECRET_KEY: string;
	export const STRIPE_WEBHOOK_SECRET: string;
	export const SUPABASE_SERVICE_ROLE_KEY: string;
}

declare module '*.svg?raw' {
	const content: string;
	export default content;
}

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export { }