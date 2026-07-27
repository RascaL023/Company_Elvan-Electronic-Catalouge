# Architecture — ElectroShop

## Overview

ElectroShop uses a **three-layer architecture** with clear separation between UI, business logic, and data access. The core design principle is **database-agnostic**: all data access goes through repository interfaces, making it trivial to swap data sources (FakeStoreAPI, Firebase, Supabase, PostgreSQL, etc.) without touching UI or business logic.

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
│   │   ├── cart.ts                # CartItem entity
│   │   └── common.ts              # SortOption, AsyncState<T>
│   └── repositories/
│       ├── product.repository.ts  # ProductRepository interface
│       └── cart.repository.ts     # CartRepository interface
│
├── data/                          # Concrete implementations — swappable
│   ├── fakestore/
│   │   ├── fakestore.mapper.ts                 # API → domain transformer
│   │   └── fakestore-product.repository.ts     # ProductRepository impl
│   └── local/
│       └── local-cart.repository.ts            # CartRepository impl (localStorage)
│
├── services/
│   ├── DataProvider.tsx           # Context: injects repository instances
│   ├── UiProvider.tsx             # Context: global UI state (drawer, etc.)
│   └── product.service.ts         # Pure functions: filter, sort, search
│
├── hooks/
│   ├── useRepository.ts           # Consumes DataProvider context
│   ├── useProducts.ts             # Async fetch + filter + sort
│   ├── useProduct.ts              # Single product by ID
│   ├── useCart.ts                 # Cart state + persistence
│   └── useDebounce.ts             # Input debounce utility
│
├── components/
│   ├── ui/                        # Primitive, reusable UI atoms
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Rating.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   └── SearchBar.tsx
│   ├── layout/                    # Page structure components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageLayout.tsx
│   └── feedback/                  # User feedback states
│       ├── ErrorState.tsx
│       ├── EmptyState.tsx
│       └── LoadingGrid.tsx
│
├── features/                      # Feature-specific composites
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── SortControl.tsx
│   │   ├── ProductModal.tsx
│   │   └── ProductsPage.tsx       # Route: /
│   ├── product-detail/
│   │   └── ProductDetailPage.tsx   # Route: /product/:id
│   └── cart/
│       ├── CartDrawer.tsx          # Slide-out panel
│       ├── CartItemRow.tsx
│       ├── CartSummary.tsx
│       └── CartPage.tsx            # Route: /cart
│
├── utils/
│   └── formatters.ts
├── main.tsx
└── index.css
```

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  providers.tsx                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  repositories = { product: FakeStoreProductRepo,   │   │
│  │                   cart: LocalCartRepo }             │   │
│  └────────────────────────┬───────────────────────────┘   │
│                           │ context                        │
│  ┌────────────────────────▼───────────────────────────┐   │
│  │  Hooks (useProducts, useProduct, useCart)          │   │
│  │  Called by feature components                      │   │
│  └────────────────────────┬───────────────────────────┘   │
│                           │ repository interface           │
│  ┌────────────────────────▼───────────────────────────┐   │
│  │  Repository Implementation                          │   │
│  │  FakeStoreProductRepository / LocalCartRepository   │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Layer Rules

| Layer | Can import from | Cannot import from |
|-------|----------------|-------------------|
| `core/` | Nothing | Any other layer |
| `data/` | `core/` | `components/`, `features/` |
| `services/` | `core/` | `data/`, `components/`, `features/` |
| `hooks/` | `services/`, `core/` | `components/`, `features/` |
| `components/` | `core/`, `hooks/` | `data/` |
| `features/` | `components/`, `hooks/`, `core/` | `data/` |
| `app/` | Everything | — |

## Repository Interfaces

### ProductRepository

```typescript
interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
}
```

### CartRepository

```typescript
interface CartRepository {
  load(): Promise<CartItem[]>;
  save(items: CartItem[]): Promise<void>;
}
```

## How to Add a New Data Source

### Example: Adding Firebase

1. Create a new file `src/data/firebase/firebase-product.repository.ts`:

```typescript
import { ProductRepository } from '../../core/repositories/product.repository';
import { Product } from '../../core/types/product';

export class FirebaseProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    // Firebase/Firestore fetch logic
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getById(id: string): Promise<Product | null> {
    const doc = await getDoc(doc(db, 'products', id));
    if (!doc.exists()) return null;
    return { id: doc.id, ...doc.data() } as Product;
  }
}
```

2. Swap in `src/app/providers.tsx`:

```typescript
const repositories = {
  product: new FirebaseProductRepository(),  // ← only change needed
  cart: new LocalCartRepository(),
};
```

**Zero changes** in hooks, components, features, or pages.

## Migrating from FakeStoreAPI to Any Backend

| What changes | What stays the same |
|-------------|-------------------|
| `src/data/{source}/` — new repository implementation | All `core/` types and interfaces |
| One line in `src/app/providers.tsx` | All `hooks/` |
| | All `components/` |
| | All `features/` |
| | All `services/` |
| | Router and pages |

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | `ProductsPage` | Product catalog with search, sort, grid |
| `/product/:id` | `ProductDetailPage` | Full product detail page |
| `/cart` | `CartPage` | Full cart management |
| `*` | `NotFoundPage` | 404 |

## Tech Stack

- **React 18** — UI library
- **TypeScript** — Type safety
- **Vite 5** — Build tool
- **Tailwind CSS 3** — Styling
- **React Router 6** — Client-side routing
- **Zero heavy UI libraries** — All components hand-built with Tailwind

## Development

```bash
npm install
npm run dev      # Development server
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
```
