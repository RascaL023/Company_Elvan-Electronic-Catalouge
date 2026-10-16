# API adapters (VPS backend)

Implementations of the domain contracts in `src/core/` that speak HTTP to the
Elvan Catalog API (Go). They are **implemented and selectable**, not placeholders:

```text
ProductRepository
    ├── FirebaseProductRepository   (src/data/firebase/)  ← active until cutover
    ├── MockProductRepository       (src/data/mock/)
    └── ApiProductRepository        (here)
```

Switching a concern to the API is an **env change only** — both
implementations stay in the repo, so flipping a value back is an instant
rollback. See `src/config/api.ts` for the switch semantics and
`src/app/composition.ts` for the single wiring point.

## Files

| File | Contract |
|---|---|
| `http-client.ts` | `apiRequest()` — `fetch` with `credentials: 'include'`, base URL from env, error envelope → typed `ApiError`; `onUnauthorized()` untuk reaksi global `401` |
| `mappers.ts` | DTO ↔ domain mapping (image shape, write body, dates) |
| `api-product.repository.ts` | `ProductRepository` |
| `api-category.repository.ts` | `CategoryRepository` |
| `api-brand.repository.ts` | `BrandRepository` |
| `api-auth.service.ts` | `AuthService` via the admin session cookie (`GET /auth/me`); menurunkan status login saat `onUnauthorized` menyala |
| `api-image-upload.service.ts` | `ImageUploadService` (signature from the API, upload still browser → ImageKit) |

## Enabling it

```bash
VITE_API_BASE_URL="/api/v1"     # production: relative, Caddy serves site + /api
# VITE_API_BASE_URL="http://localhost:8080/api/v1"   # dev (add the Vite origin
#                                                    # to CORS_ALLOWED_ORIGINS)
VITE_AUTH_BACKEND="api"         # or "firebase" to keep Firebase Auth
VITE_MEDIA_BACKEND="api"        # or "firebase" to keep the Cloudflare Worker
```

With `VITE_API_BASE_URL` empty the API is off and Firebase stays the backend.
The per-concern overrides allow a staged cutover (e.g. data + auth on the API
while uploads still go through the Worker).

## Rules for this directory

- Depend only on the domain interfaces/types (`src/core/`) and `src/config/api.ts`.
- Never import Firestore/Firebase SDKs — `npm run check:boundaries` enforces this.
- Keep image references provider-independent relative keys.

## Mismatches handled here

- **Images**: API `images: [{ key, fileId }]` ↔ domain `images: string[]` +
  `imageFileIds?: string[]` (parallel arrays).
- **Write bodies**: the API rejects unknown fields, so `id`/`imageFileIds` are
  never sent; `brand` is sent as `''` (not omitted) when cleared.
- **Ids**: `getById` passes the id through as-is — the backend resolves a UUID
  or a legacy Firestore id, so old `/product/:id` URLs keep working.

## Backend behaviors this layer relies on

- Auth: HttpOnly session cookie; `401` means "no/expired session".
  `apiRequest` melaporkan `401` dari endpoint selain `POST /auth/login` lewat
  `onUnauthorized`, dan `ApiAuthService` memakainya untuk mengubah status login
  UI saat sesi habis/dicabut di tengah pemakaian (tanpa perlu reload).
- Media: `GET /media/signature` requires an admin session. `ApiImageUploadService`
  sets `cleansUpImagesServerSide = true`, so call sites (`useDeleteProduct`,
  `ProductForm`) do **not** delete files in the browser — the API removes them
  after commit when a product is deleted or images are replaced.
- Errors: `{ error: { code, message, details } }` → `ApiError.code/status/details`,
  with `details` flattened into a user-facing message.

## Verifying

```bash
npm run check:boundaries   # no Firebase imports / no env reads on this path
npm run build              # tsc + vite build
```

Backend side: `make test`, `make test-integration`, and
`npx @redocly/cli lint api/openapi.yaml` in the API repo.
