# Database schema

PostgreSQL schema used by BezProvizije on Supabase. Render the Mermaid diagram on GitHub or at [mermaid.live](https://mermaid.live).

## Enums

| Enum | Values |
|------|--------|
| `user_role` | `user`, `admin` |
| `listing_type` | `sale`, `rent` |
| `property_type` | `apartment`, `house`, `business`, `garage`, `room`, `land` |
| `approval_status` | `pending`, `approved`, `rejected` |
| `bp_purchase_status` | `pending`, `completed`, `failed`, `expired` |
| `bp_payment_method` | `card`, `bank_transfer`, `sepa_debit`, `manual_bank` |
| `bp_transaction_type` | `purchase`, `listing_publish`, `refund`, `admin_adjust` |

## Tables (summary)

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (1:1 with `auth.users`), username, BP balance, role |
| `properties` | Listings (sale/rent) with location and JSON attributes |
| `property_images` | Ordered listing photos in Storage |
| `favorites` | User ↔ listing saved favorites |
| `blogs` | Admin-authored blog posts |
| `token_settings` | Singleton BP pricing / listing costs |
| `bp_purchases` | BP token purchase attempts (Stripe / manual bank) |
| `bp_transactions` | BP ledger (purchase, publish, refund, admin adjust) |

## Entity-relationship diagram

```mermaid
erDiagram
  auth_users ||--|| profiles : "1:1"
  profiles ||--o{ properties : owns
  profiles ||--o{ blogs : authors
  profiles ||--o{ favorites : saves
  profiles ||--o{ bp_purchases : buys
  profiles ||--o{ bp_transactions : ledger
  properties ||--o{ property_images : has
  properties ||--o{ favorites : favorited

  profiles {
    uuid id PK
    text full_name
    text username
    text phone
    text email
    user_role role
    int bp_balance
    timestamptz created_at
    timestamptz updated_at
  }

  properties {
    uuid id PK
    uuid owner_id FK
    text title
    text description
    listing_type listing_type
    property_type property_type
    approval_status approval_status
    numeric price
    numeric sqm
    text address
    float lat
    float lng
    text county
    text city
    text neighborhood
    jsonb attributes
    boolean is_published
  }

  property_images {
    uuid id PK
    uuid property_id FK
    text storage_path
    smallint sort_order
  }

  favorites {
    uuid user_id PK_FK
    uuid property_id PK_FK
  }

  blogs {
    uuid id PK
    text slug UK
    text title
    text content
    text cover_image_path
    boolean is_published
    uuid author_id FK
  }

  token_settings {
    int id PK
    int sale_listing_bp_cost
    int rent_listing_bp_cost
    int bp_price_cents
  }

  bp_purchases {
    uuid id PK
    uuid user_id FK
    int bp_amount
    int amount_cents
    bp_payment_method payment_method
    bp_purchase_status status
    text stripe_checkout_session_id
  }

  bp_transactions {
    uuid id PK
    uuid user_id FK
    int amount
    bp_transaction_type type
    text reference_id
  }
```

## Storage buckets

- `property-images` — public read; listing photos
- `blog-images` — public read; blog cover / inline images

## Access model

Row Level Security (RLS) on all app tables: users manage their own data; admins can manage listings and users; the public can read **approved** listings and published blogs.
