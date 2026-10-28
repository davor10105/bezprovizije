# Application architecture

High-level schematic of BezProvizije.hr: hosting, app layers, and external services. Render the Mermaid diagram on GitHub or at [mermaid.live](https://mermaid.live).

## Architecture diagram

```mermaid
flowchart TB
  subgraph Clients
    Browser["Browser / Mobile web"]
  end

  subgraph Hosting["Hosting"]
    Vercel["Vercel<br/>SvelteKit SSR + API routes"]
  end

  subgraph App["BezProvizije.hr app"]
    UI["SvelteKit UI<br/>pages, navbar, forms"]
    API["App API routes<br/>/api/*"]
    Server["Server loaders & actions"]
  end

  subgraph Supabase["Supabase"]
    Auth["Auth<br/>email/password sessions"]
    DB["PostgreSQL<br/>+ Row Level Security"]
    Storage["Storage buckets<br/>property-images, blog-images"]
  end

  subgraph Payments["Payments"]
    Stripe["Stripe Checkout<br/>card · bank transfer · SEPA"]
    ManualBank["Manual IBAN + HRVHUB30 QR<br/>admin credits BP"]
  end

  subgraph Geo["Location & maps"]
    Libar["Libar API<br/>HR addresses / GPS"]
    OSM["OpenStreetMap tiles<br/>via Leaflet"]
  end

  Browser --> Vercel
  Vercel --> UI
  Vercel --> API
  Vercel --> Server

  UI --> Auth
  Server --> DB
  Server --> Storage
  API --> DB

  API -->|"/api/stripe/*"| Stripe
  Stripe -->|"webhooks"| API
  API -->|"/api/bp/manual-bank"| ManualBank

  API -->|"/api/geocode"| Libar
  Server --> Libar
  UI -->|"map display"| OSM
```

## Services & APIs

| Layer | Service | Role |
|--------|---------|------|
| Hosting | **Vercel** | Deploy SvelteKit (SSR, serverless API) |
| Framework | **SvelteKit** | UI + server loaders/actions + `/api/*` |
| Backend / DB | **Supabase PostgreSQL** | Profiles, listings, favorites, blogs, BP |
| Auth | **Supabase Auth** | Login / register, session cookies |
| Files | **Supabase Storage** | Listing & blog images |
| Payments | **Stripe** | Buy BP (card, bank transfer, SEPA) + webhooks |
| Payments | **Manual bank QR** | HRVHUB30 barcode; BP added by admin |
| Addresses | **Libar** | Autocomplete + reverse geocode (DGU data) |
| Maps | **Leaflet + OSM tiles** | Map UI only (display, not geocoding) |

## Internal app API routes

| Route | Purpose |
|-------|---------|
| `/api/geocode` | Address search / reverse geocode via Libar |
| `/api/stripe/checkout` | Start Stripe Checkout for BP purchase |
| `/api/stripe/webhook` | Stripe payment lifecycle → credit BP |
| `/api/bp/manual-bank` | Generate HRVHUB30 QR for IBAN payment |
| `/api/blog/upload-image` | Admin blog image upload to Storage |

## Related docs

- [Database schema](./database-schema.md)
