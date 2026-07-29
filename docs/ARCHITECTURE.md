# Architecture — Elvan Electronic

## Overview

This project uses a **three-layer architecture** for clarity, testability, and easy migration. All data access goes through repository interfaces. All image URLs are resolved using an abstraction layer, so the UI never cares where images are stored. There is zero coupling to any backend, storage, or image hosting solution.

There is a minimal Admin area for product CRUD (create, update, delete) and image key management. Images are referred to by key only (not URLs), so the system is ready for local/public folder or migration to Cloudflare R2 (or any object storage/backend).

## Folder Structure

```
src/
├── app/                           # Application entry & composition root
│   ├── App.tsx                    # Root component
│   ├── providers.tsx              # Wires repositories into DataProvider
│   └── router.tsx                 # React Router route definitions
│
├── core/                          # Domain — zero external dependencies
│   ├── types/
│   │   ├── product.ts             # Product entity
│   │   ├── category.ts            # Category entity
│   │   └── common.ts              # SortOption, etc
│   └── repositories/
│       ├── product.repository.ts  # ProductRepository interface (+CRUD)
│       └── category.repository.ts # CategoryRepository interface
│
├── data/                          # Concrete implementations — swappable
│   └── mock/                      # In-memory mock for demo/development
│       ├── mock-product.repository.ts
│       └── mock-category.repository.ts
│
├── services/
│   ├── DataProvider.tsx           # Context: injects repository instances
│   ├── product.service.ts         # Pure functions: filter, sort, search
│   └── imageService.ts            # Image URL resolver/abstraction
│
├── config/
│   └── storage.ts                 # Storage provider config/env util
│
├── hooks/
│   ├── useRepository.ts           # Consumes DataProvider context
│   ├── useProducts.ts             # Fetch + filter + sort
│   └── useProduct.ts              # Single product by ID
│
├── components/
│   ├── ui/                        # Primitive, reusable UI atoms
│   ├── layout/                    # Page structure components
│   └── feedback/                  # User feedback states
│
├── features/                      # Feature-specific composites
│   ├── products/                  # Catalog grid, UI, modal, etc.
│   ├── product-detail/            # Product detail page
│   └── admin/                     # Admin CRUD (dashboard, form, layout)
│
├── utils/
│   ├── formatters.ts              # Currency, etc.
│   └── categories.ts              # Localized category name mapping
└── main.tsx
```

## Data & Image Flow

```
┌──────────────────────────────────────────────────────────────┐
│  providers.tsx                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  repositories = { product: MockProductRepo, ... }     │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │ context                                  │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  Hooks (useProducts, useProduct, ...)                 │  │
│  │  Called by feature components                         │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │ repository interface                     │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  Repository Implementation (mock, api, firestore)     │  │
│  └───────────────────────────────────────────────────────┘  │
│                  │ image key                               │
│  ┌───────────────▼─────────────────────────────┐           │
│  │  imageService (getImageUrl, etc)            │           │
│  │  Converts image key → public URL             │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

- UI **never knows** image storage location. Always calls `getImageUrl(key)` / `ImageService`.
- Product data (including image) comes from repository, not directly via Firestore/API.
- Migrasi image storage hanya perlu ganti config/env di storage.ts, bukan rewrite frontend.

## Repository Interfaces

### ProductRepository (current)
```typescript
import { Product } from '../types/product';
export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(payload: ProductPayload): Promise<Product>;
  update(id: string, payload: Partial<ProductPayload>): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

### CategoryRepository
```typescript
export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
}
```

## Image Storage Abstraction

- Image disimpan di `public/assets/images/products/...` (local dev/demo)
- Product hanya simpan array string image keys, misal `assets/images/products/refrigerator/Kulkas1.webp`
- Saat migrasi ke R2/cloud: upload file ke bucket, pakai key sama
- `storage.ts` + config/env akan resolve ke URL lokal atau CDN sesuai mode
- Semua akses image di UI selalu lewat `ImageService` / `getImageUrl`, tidak pernah hardcoded.
- Produk tetap portable, migrasi semudah ganti config/env

## Admin CRUD (fitur minimal/MVP)

- /admin           — dashboard, list produk, tombol edit/hapus, tombol tambah
- /admin/products/new       — tambah produk
- /admin/products/:id/edit — edit produk
- Form complete: semua field, images (array key, manual input, reorder, set primary)
- Tidak ada upload gambar (image key manual, siap migrasi)
- Semua operasi CRUD lewat repository
- Fitur advanced (upload image, auth, kategori CRUD, dll) siap untuk backward-compatible penambahan

## Routing

| Path                        | Page / Feature                 |
|-----------------------------|--------------------------------|
| /                           | Katalog produk                 |
| /product/:id                | Halaman detail                 |
| /admin                      | Dashboard admin (produk)       |
| /admin/products/new         | Tambah produk                  |
| /admin/products/:id/edit    | Edit produk                    |
| *                           | 404                            |

## Migrasi dan Integrasi

- Untuk ganti backend (misal dari mock → Firebase/REST), cukup buat class baru (implementasi `ProductRepository`), dan swap di `providers.tsx`:
  ```ts
  const productRepository = new FirebaseProductRepository(); // atau ApiProductRepository
  ```
- Tidak perlu ubah UI, service, atau form admin.
- Untuk storage migrasi: image key tetap (termasuk subfolder/category), hanya upload ke cloud dan ganti config/env

## Tech Stack
- **React 18** — UI library
- **TypeScript** — Type safety everywhere
- **Vite 5** — Dev/build tool
- **Tailwind CSS 3** — Atomic CSS styling
- **React Router 6** — Routing
- **Zero UI frameworks** — Semua komponen atom/molekul mandiri

## Development

```bash
npm install
npm run dev      # Jalankan dev server
npm run build    # TypeScript check + production build
npm run preview  # Preview
```
