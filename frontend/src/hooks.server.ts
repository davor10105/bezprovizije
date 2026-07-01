// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public'
import { getSafeUser, hasAuthCookies } from '$lib/auth'
import { createServerClient } from '@supabase/ssr'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' })
        })
      },
    },
  })

  // Only validate session when auth cookies exist; avoids refresh errors on logged-out users
  if (hasAuthCookies(event.cookies)) {
    await getSafeUser(event.locals.supabase, event.cookies)
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name: string) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}