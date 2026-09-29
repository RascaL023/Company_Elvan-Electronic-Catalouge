# Future API adapters (not implemented yet)

This directory reserves the boundary for a future VPS-backed HTTP/API
implementation of the domain repository contracts in
`src/core/repositories/`:

```text
ProductRepository
    ├── FirebaseProductRepository   (current, `src/data/firebase/`)
    ├── MockProductRepository       (current, `src/data/mock/`)
    └── ApiProductRepository        (future, here)
```

The same applies to categories and brands.

Rules for a future implementation:

- Depend only on the domain interfaces and types (`src/core/`).
- Speak HTTP(S) to the backend; never import Firestore/Firebase SDKs.
- Honor the application-level `*ListOptions` / `*ListResult` contracts
  (filtering, sorting, search, and pagination may move server-side).
- Keep image references as provider-independent relative keys.

Firebase remains the active implementation. See issue #1.
