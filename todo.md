Part 1: URL Configuration
Path: Authentication → URL Configuration

Site URL
This is your app’s main address.

Local development:

http://localhost:5173
(npm run dev for SvelteKit/Vite usually uses port 5173. If yours is different, check the terminal when you start the dev server.)

Production later:

https://bezprovizije.hr
(or whatever your real domain is)

Redirect URLs
These are the exact paths Supabase may redirect to after auth. Add full URLs, one per line:

For local dev:

http://localhost:5173/auth/callback
http://localhost:5173/auth/confirm
When you deploy, also add:


https://your-domain.com/auth/callback
https://your-domain.com/auth/confirm

-------------------------

IMAS CLIENT I SECRET ZA GOOGLE AUTH U MOZILLI SPREMLJEN

-------------------------

Production later
Yes — you switch the webhook URL when you deploy; you don’t need localhost in production.

Deploy the app (e.g. https://bezprovizije.hr)
Stripe Dashboard → Developers → Webhooks → Add endpoint
URL: https://bezprovizije.hr/api/stripe/webhook
Select events:
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
After creating the endpoint, open it → Signing secret → copy whsec_...
Set production env vars on your host (Vercel, etc.):
STRIPE_SECRET_KEY=sk_live_... (live key when you go live)
STRIPE_WEBHOOK_SECRET=whsec_... (from this production endpoint, not the CLI secret)