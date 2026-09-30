# Architecture — Elvan Electronic

## Overview

This project uses a **repository-based architecture** for clarity, testability, and easy migration. All data access goes through repository interfaces. All image resolution goes through a service layer, so the UI never cares where images are stored.

Current state:
- **Public catalog** — product listing, detail page, category & brand filtering.
- **Admin area** — full CRUD for **products, categories, and brands**, protected by Firebase Auth.
- **Image hosting** — relative keys only (`assets/images/products/...`); the resolver maps them to ImageKit CDN URLs with transforms. Provider-agnostic: switching backends needs no DB changes.
- **Image upload** — browser uploads directly to ImageKit (file never touches our backend); the upload **signature** is issued by a small Cloudflare Worker that holds the ImageKit private key.

This document describes the current, real architecture. The quick-start and day-to-day commands live in `README.md`; this file focuses on *why* things are structured the way they are and how data flows.

## Repository Pattern (the core abstraction)

All data access is behind interfaces in `src/core/repositories/`:

| Interface | File | Notes |
|---|---|---|
| `ProductRepository` | `product.repository.ts` | CRUD + `list()` (pagination/filter/sort/search) |
| `CategoryRepository` | `category.repository.ts` | CRUD |
| `BrandRepository` | `brand.repository.ts` | CRUD |

Every implementation is swappable without touching the UI:

- `src/data/mock/` — in-memory (demo/dev without Firebase).
- `src/data/firebase/` — Firestore-backed (production).
- `src/services/cached-*.repository.ts` — thin cache wrapper around any of the above.

The single wiring point is `src/app/providers.tsx`:

```ts
const useFirebase = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

const productRepository = new CachedProductRepository(
  useFirebase ? new FirebaseProductRepository() : new MockProductRepository()
);
```

Components consume via `useRepository()`. **To migrate to a custom backend (e.g. a VPS API), implement the interface and swap it here — nothing else changes.**

### ProductPayload

```ts
export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };
```

- `id` is **optional**. When provided it becomes the Firestore document id (`setDoc`); otherwise Firestore auto-generates it (`addDoc`).
- The document **never stores an `id` field** — the id is the document name. Explicitly writing `id: undefined` throws in the current Firestore SDK, so the repository strips it via destructuring.

## Folder Structure

```
src/
├── app/                           # Entry & composition root
│   ├── App.tsx                    # Root component
│   ├── providers.tsx              # Wires repository implementations
│   └── router.tsx                 # All routes (public + admin, lazy-loaded)
│
├── core/                          # Domain — zero external dependencies
│   ├── types/                     # product.ts, category.ts, brand.ts, common.ts
│   └── repositories/              # Repository interfaces (+payload types)
│
├── data/                          # Concrete implementations — swappable
│   ├── mock/                      # In-memory (mock-product/category/brand)
│   └── firebase/                  # Firestore (repos + docToProduct mapper)
│
├── services/                      # Cross-cutting logic
│   ├── DataProvider.tsx           # Context: injects repository instances
│   ├── cache.ts                   # SimpleCache (in-memory TTL)
│   ├── cached-*.repository.ts     # Cached wrappers over any repo impl
│   ├── imageService.ts            # Image URL resolver (UI-facing)
│   └── imagekit.ts                # ImageKit signature fetch + upload
│
├── config/                        # Config from env
│   ├── firebase.ts                # Lazy Firebase app/db/auth init
│   ├── imagekit.ts                # ImageKit public key / URL / auth endpoint
│   └── storage.ts                 # Legacy storage-provider config (local)
│
├── hooks/                         # useRepository, useProducts, useProduct,
│   │                              # useCategories, useAuth
│   ├── components/                # ui/ (Skeleton, Rating, Modal...), layout/,
│   └── ...                        # feedback/
├── features/                      # products, product-detail, admin, auth
├── utils/                         # formatters, categories, hash (slug/id), imageUrl
└── main.tsx

imagekit-auth-worker/              # Cloudflare Worker (separate deploy)
└── src/index.ts                   # GET /signature → { token, expire, signature }

scripts/                           # seed.cjs (+resolve-image.cjs), service-account.json (gitignored)
```

## Data Flow

```
components  ──useRepository()──▶  repository interface
                                        │
                      ┌─────────────────┴─────────────────┐
                 (Firebase/mock)                     (cached wrapper)
                      │
                      ▼
              Firestore collection
              products / categories / brands
```

- UI **never** talks to Firestore directly — always through the repository interface.
- Reads are cached by the `Cached*Repository` wrappers.

### Image resolution

All display components go through `ImageService` / `getImageUrl` (`src/utils/imageUrl.ts`).
The database stores **relative keys only** (provider-agnostic), e.g.
`assets/images/products/television/pld-24v1855.jpg`. The resolver maps a key to a
full URL based on `VITE_STORAGE_PROVIDER`:

- `imagekit` → `https://ik.imagekit.io/elvanelectronic/<key>` + `?tr=…` transforms
  (thumbnails/resized variants via `getThumbnailUrl`, `getMediumImageUrl`, `getDetailImageUrl`).
- `local` (dev/mock) → served from `public/`.
- `s3` / `cloudflare` / `cloudinary` → their respective URL builders.

```
getImageUrl("assets/images/products/television/pld-24v1855.jpg", { width: 400, height: 300 })
  → "https://ik.imagekit.io/elvanelectronic/assets/images/products/television/pld-24v1855.jpg?tr=w-400,h-300,q-70"
```

This is what keeps storage provider-agnostic: **swapping the image backend never
touches database records.**

### Admin image upload flow

```
ProductForm selects a file
  → ① GET {VITE_IMAGEKIT_AUTH_ENDPOINT}/signature   (Cloudflare Worker; Origin allowlist enforced)
  → ② POST file → https://upload.imagekit.io/api/v1/files/upload
       folder: assets/images/products/{category}/   fileName: {slug}.{ext}   useUniqueFileName: true
  → ③ relative key (response.filePath, no leading slash) stored into form.images[i]
  → submit → product written to Firestore (requires admin auth)
```

- The **private key never leaves the Worker** (`IMAGEKIT_PRIVATE_KEY` Cloudflare secret + local `.dev.vars`).
- Swapping the signature backend (Worker → VPS) = change `VITE_IMAGEKIT_AUTH_ENDPOINT` and keep the `GET /signature → { token, expire, signature }` contract.
- Migrating local seed images → ImageKit: `scripts/migrate-to-imagekit.cjs` (uploads `public/assets/images/products/**` to the same relative folder and normalizes any legacy keys in Firestore).

## Routing

| Path | Page / Feature |
|---|---|
| `/` | Public product catalog |
| `/product/:id` | Product detail |
| `/admin/login` | Admin login (Firebase Auth, email/password) |
| `/admin` | Admin dashboard (products tab, pagination, search) |
| `/admin/products/new` · `/admin/products/:id/edit` | Product form (incl. ImageKit upload) |
| `/admin/categories` · `/admin/categories/new` · `/admin/categories/:id/edit` | Category CRUD |
| `/admin/brands` · `/admin/brands/new` · `/admin/brands/:id/edit` | Brand CRUD |
| `*` | 404 |

`AdminLayout` redirects to `/admin/login` when unauthenticated. Admin routes are lazy-loaded; Vite splits `vendor` and `firebase` into separate chunks.

## Firestore & Security Rules

Rules in `firestore.rules` cover three collections — `products`, `categories`, `brands`:

- `read`: public.
- `create/update/delete`: require `request.auth != null`.

Deploy after editing: `firebase deploy --only firestore:rules`.

> Note: `scripts/seed.cjs` uses the Firebase Admin SDK (service account) and therefore **bypasses rules**. Seeding data into Firestore from the console/dashboard has the same effect — normal for a server-side seed path.

## Migrating / Extending

- **New backend**: add e.g. `src/data/api/api-product.repository.ts` implementing `ProductRepository`, swap in `providers.tsx`.
- **New data source**: same pattern for category/brand.
- **Image storage**: the database only ever stores **relative keys**; the resolver in `src/utils/imageUrl.ts` maps them to provider URLs (ImageKit today, others via `VITE_STORAGE_PROVIDER`). Uploads target ImageKit; pointing elsewhere means changing the resolver config — display code and DB records stay untouched.
- **Custom domain / VPS move**:
  - FE auth endpoint → change `VITE_IMAGEKIT_AUTH_ENDPOINT`.
  - Worker `ALLOWED_ORIGINS` in `imagekit-auth-worker/wrangler.jsonc` → add the FE origin.
  - Firestore → configure the new Firebase project (or new repository impl).

## Tech Stack

| Layer | Tech |
|---|---|
| UI | React 18, TypeScript, Tailwind CSS 3 |
| Build | Vite 5 (manual chunking: vendor + firebase) |
| Routing | React Router 7 |
| Data | Firebase Firestore (web SDK v12) |
| Auth | Firebase Authentication (email/password) |
| Images | ImageKit (upload + CDN) |
| Upload signature | Cloudflare Worker (`imagekit-auth-worker`) |
| Hosting | Firebase Hosting (statics) · Cloudflare Workers (signature) |
| Seed/tooling | firebase-admin, Node scripts (`scripts/`) |
