# Architecture — Elvan Electronic

## Overview

This project uses a **repository-based architecture** for clarity, testability, and easy migration. All data access goes through repository interfaces. All image resolution goes through a service layer, so the UI never cares where images are stored.

> **Migration-ready, Firebase still active (issue #1).** The frontend is
> prepared for a future move to a VPS-hosted backend, but no migration has
> happened: Firestore, Firebase Auth, the Cloudflare Worker, ImageKit, and
> Firebase Hosting remain the active infrastructure. A future migration
> should only require replacing infrastructure adapters (see
> [Migration boundary](#migration-boundary)), not rewriting features.

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
- `src/data/api/README.md` — reserved slot for a future VPS-backed HTTP
  implementation (no code yet).
- `src/services/cached-*.repository.ts` — thin cache wrapper around any of the above.

The single wiring point is the composition root, `src/app/composition.ts`:

```ts
export const repositories: RepositorySet = createRepositories();
// firebase when VITE_FIREBASE_PROJECT_ID is set,
// mock fallback in dev, 'api' fails fast until adapters exist.
```

`src/app/providers.tsx` is a thin wrapper that injects `repositories` into
`DataProvider`. Components consume via `useRepository()`. **To migrate to a
custom backend (e.g. a VPS API), implement the interface and swap it in
`composition.ts` — nothing else changes.**

### ProductPayload

```ts
export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };
```

- `id` is an **optional client hint**, kept for Firestore compatibility.
  Firestore/mock implementations honor it (`setDoc` vs `addDoc`); a future
  SQL-backed API (serial/uuid primary key) MAY ignore it and always return
  a server-generated id. Callers must use the returned `Product.id`.
- The document **never stores an `id` field** — the id is the document name.

### Pagination cursors are opaque

`ProductListOptions.cursor` / `ProductListResult.cursor` are
implementation-defined tokens: pass the previous result's `cursor` back
without parsing or constructing it. The Firebase implementation derives it
from the in-memory dataset; a future API may use a real database cursor.

### Category/brand are slugs in the domain

`Product.category` / `Product.brand` are plain slug references (e.g.
`category: 'television'`), not document refs. A future SQL schema may store
`category_id` / `brand_id` foreign keys, but the backend mapper must resolve
them back to slugs so the domain shape stays unchanged.

## Auth boundary

Auth UI depends on the application-level contract in
`src/core/auth/auth-service.ts` (`AuthUser` DTO with `uid`/`email`,
`AuthService` with `onSessionChange`/`login`/`logout`) — never on the
Firebase Auth SDK. The active implementation is `FirebaseAuthService`
(`src/data/firebase/firebase-auth.adapter.ts`), wired once as
`authService` in the composition root and consumed via `useAuth()`.
Swapping Firebase Auth for backend sessions later means pointing
`authService` at the new adapter; admin pages stay untouched.

## Folder Structure

```
src/
├── app/                           # Entry & composition root
│   ├── App.tsx                    # Root component
│   ├── composition.ts             # THE wiring point (repos, auth, images)
│   ├── providers.tsx              # Thin DataProvider wrapper
│   └── router.tsx                 # All routes (public + admin, lazy-loaded)
│
├── core/                          # Domain — zero external dependencies
│   ├── types/                     # product.ts, category.ts, brand.ts, common.ts
│   ├── repositories/              # Repository interfaces (+payload types)
│   ├── auth/                      # AuthService contract + AuthUser DTO
│   └── services/                  # ImageUploadService contract
│
├── data/                          # Concrete implementations — swappable
│   ├── mock/                      # In-memory (mock-product/category/brand)
│   ├── firebase/                  # Firestore (repos + mapper) + auth adapter
│   └── api/README.md              # Reserved slot for future VPS API repos
│
├── services/                      # Cross-cutting logic
│   ├── DataProvider.tsx           # Context: injects repository instances
│   ├── cache.ts                   # SimpleCache (in-memory TTL)
│   ├── cached-*.repository.ts     # Cached wrappers over any repo impl
│   ├── imageService.ts            # Image URL resolver (UI-facing display)
│   └── imagekit.ts                # ImageKitUploadService (upload impl, wired via composition)
│
├── config/                        # Config from env (only env readers besides composition)
│   ├── firebase.ts                # Lazy Firebase app/db init
│   ├── firebaseAuth.ts            # Lazy Firebase auth init
│   ├── imagekit.ts                # ImageKit public key / URL / auth endpoint
│   ├── site.ts                    # Store/company/contact/social for UI
│   └── storage.ts                 # Display resolver config (local|imagekit supported, rest legacy)
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
- `s3` / `cloudflare` / `cloudinary` → legacy resolvers, kept for backwards
  compatibility only (deprecated; do not add providers).

```
getImageUrl("assets/images/products/television/pld-24v1855.jpg", { width: 400, height: 300 })
  → "https://ik.imagekit.io/elvanelectronic/assets/images/products/television/pld-24v1855.jpg?tr=w-400,h-300,q-70"
```

This is what keeps storage provider-agnostic: **swapping the image backend never
touches database records.**

### Admin image upload flow

Feature code depends on `ImageUploadService`
(`src/core/services/image-upload.service.ts`) and consumes the
`imageUploadService` singleton from the composition root — never the
ImageKit SDK directly. The active implementation is `ImageKitUploadService`
(`src/services/imagekit.ts`).

```
ProductForm selects a file
  → ① GET {VITE_IMAGEKIT_AUTH_ENDPOINT}/signature   (Cloudflare Worker; Origin allowlist enforced)
  → ② POST file → https://upload.imagekit.io/api/v1/files/upload
       folder: assets/images/products/{category}/   fileName: {slug}.{ext}   useUniqueFileName: true
  → ③ relative key (response.filePath, no leading slash) stored into form.images[i]
  → submit → product written to Firestore (requires admin auth)
```

- The **private key never leaves the Worker** (`IMAGEKIT_PRIVATE_KEY` Cloudflare secret + local `.dev.vars`).
- Swapping the signature backend (Worker → VPS) = change `VITE_IMAGEKIT_AUTH_ENDPOINT` and keep the `GET /signature → { token, expire, signature }` + `DELETE /files → { deleted }` contract. No feature changes.
- Image references stay **provider-independent relative keys**; display code
  resolves them via `ImageService`/`getImageUrl`.

## Env boundary

`import.meta.env` must only be read inside `src/config/*`,
`src/app/composition.ts`, and `vite.config.ts`. Features, hooks, and
components consume `src/config/*` (e.g. `siteConfig`, `storageConfig`) or
the composition root (`repositories`, `authService`, `imageUploadService`).
Key ownership is declared in `src/vite-env.d.ts` and exemplified in
`.env.example`. Enforced by `npm run check:boundaries`.
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

## Migration boundary

Current runtime (Firebase still active — no migration performed):

```text
React UI
   |
   v
Application/domain contracts (src/core/)
   |
   v
Composition root (src/app/composition.ts)
   |
   +--> Firebase repositories --> Firestore
   |
   +--> Firebase auth adapter --> Firebase Auth
   |
   +--> Image upload service --> Cloudflare Worker --> ImageKit
```

Future architecture (possible, not implemented):

```text
React UI
   |
   v
Application/domain contracts (src/core/)
   |
   v
Composition root (src/app/composition.ts)
   |
   +--> API repositories --> VPS Backend --> PostgreSQL
   |
   +--> Backend auth adapter --> VPS Backend
   |
   +--> Image upload service --> VPS Backend --> ImageKit
```

## Migrating / Extending

- **New backend**: add e.g. `src/data/api/api-product.repository.ts` implementing `ProductRepository` (see `src/data/api/README.md`), swap in `composition.ts`. Same for category/brand.
- **New auth backend**: implement `AuthService`, point `authService` at it.
- **New image signature backend**: keep the signature contract, change `VITE_IMAGEKIT_AUTH_ENDPOINT`.
- **Image storage**: the database only ever stores **relative keys**; the resolver in `src/utils/imageUrl.ts` maps them to provider URLs (ImageKit today, `local` for dev; `s3`/`cloudflare`/`cloudinary` resolvers are legacy). Uploads target ImageKit via `ImageUploadService`; pointing elsewhere means changing the adapter config — display code and DB records stay untouched.
- **Custom domain / VPS move**:
  - FE auth endpoint → change `VITE_IMAGEKIT_AUTH_ENDPOINT`.
  - Worker `ALLOWED_ORIGINS` in `imagekit-auth-worker/wrangler.jsonc` → add the FE origin.
  - Firestore → configure the new Firebase project (or new repository impl).

## Acceptance (issue #1)

- [x] Existing Firebase-based application still works after the refactor
  (verified via `npm run build` + manual admin CRUD/upload/delete against
  Firebase + Cloudflare Worker).
- [x] Feature components do not directly import Firestore/Firebase Auth
  SDKs (`npm run check:boundaries`).
- [x] Firestore-specific types and mapping logic are contained inside
  `src/data/firebase/` (+ `src/config/firebase*.ts`).
- [x] Authentication UI depends on the app-level `AuthService` contract
  rather than Firebase APIs directly.
- [x] Repository interfaces are usable by both the current Firebase
  implementation and a future HTTP/API implementation (opaque cursors,
  `id` hints, slug refs; slot reserved in `src/data/api/README.md`).
- [x] Infrastructure selection is centralized in `src/app/composition.ts`
  (+ `src/config/*`).
- [x] Image upload/signature functionality continues working through the
  current Cloudflare Worker.
- [x] Image references remain provider-independent relative keys.
- [x] Domain types do not require Firestore-specific types.
- [x] This document describes the refactored architecture and migration
  boundary.
- [x] No VPS/backend/database migration was required.

## Verification

```bash
npm run build              # tsc + vite build (local dist only, never deploy Hosting here)
npm run check:boundaries   # firebase/env/ImageKit leak checks
```

Manual check against the existing Firebase + Cloudflare Worker infra:
admin login, product/category/brand CRUD, image upload via ProductForm,
image delete via product delete/edit. Firebase remains the active
infrastructure after this refactor.

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
