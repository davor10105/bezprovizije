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

-------------------
DEPLOY

Deploy on Vercel (recommended)
Push your branch to GitHub (you have a remote already), then merge to main when ready.
Go to vercel.com → New Project → import the repo.
Set the Root Directory to frontend (your app lives in the subfolder, not the repo root). Vercel then auto-detects SvelteKit — leave build/output settings default.
Add environment variables (Project → Settings → Environment Variables). From your .env:
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET (see step 6 — you'll update this after)
STRIPE_BANK_TRANSFER_COUNTRY (e.g. DE)
Click Deploy. You get a URL like https://bezprovizije.vercel.app (add your custom domain later under Settings → Domains).
Post-deploy wiring (don't skip these)
Stripe webhook → In the Stripe Dashboard, create/point a webhook to https://your-domain/api/stripe/webhook, subscribe to checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired. Copy the new signing secret into STRIPE_WEBHOOK_SECRET on Vercel and redeploy.
Supabase Auth → Dashboard → Authentication → URL Configuration: set Site URL to your production domain and add https://your-domain/auth/callback and https://your-domain/auth/confirm to the redirect allowlist. (Google OAuth keeps using the Supabase callback, so no change needed there.)
Apply pending DB migrations to your Supabase project — especially 011_bp_admin.sql, which hasn't been applied yet.
Alternatives
Cloudflare Pages — also cheap/fast and adapter-auto supports it, but its Workers runtime occasionally trips up Node-only libraries (stripe generally works, but Vercel is the smoother default here).
Netlify — also zero-config via adapter-auto; comparable to Vercel.
Node server / VPS (Railway, Fly.io, Render) — more control, but you'd switch to @sveltejs/adapter-node and manage the host yourself. Not necessary for your case.
For minimal friction, go Vercel. Want me to pin the adapter explicitly to @sveltejs/adapter-vercel (optional, makes builds deterministic) or add a vercel.json / production .env.example?