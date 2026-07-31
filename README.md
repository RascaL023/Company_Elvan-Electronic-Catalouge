# Elvan Electronic — Katalog Elektronik

Website katalog elektronik single-page (SPA): halaman publik untuk melihat produk, plus area admin untuk mengelola **produk, kategori, dan brand** beserta **upload gambar**.

Proyek ini ditulis untuk mudah dipindah tangankan — semua akses data lewat abstraksi repository, dan resolusi gambar lewat service terpisah. Jadi saat nanti dipindah ke tim baru, ke backend sendiri, atau pindah domain/VPS, perubahannya kecil dan terisolasi.

---

## Daftar Isi
1. [Tech Stack (ringkas)](#tech-stack-ringkas)
2. [Struktur Proyek](#struktur-proyek)
3. [Konsep Arsitektur (baca ini dulu)](#konsep-arsitektur-baca-ini-dulu)
4. [Alur Data & Upload](#alur-data--upload)
5. [Cara Menjalankan](#cara-menjalankan)
6. [Konfigurasi Environment](#konfigurasi-environment)
7. [Firestore & Security Rules](#firestore--security-rules)
8. [Catatan Penting / Gotchas](#catatan-penting--gotchas)
9. [Dokumentasi Lain](#dokumentasi-lain)

---

## Tech Stack (ringkas)

| Lapisan | Teknologi |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router 7 |
| Data store | Firebase Firestore + Firebase Authentication (login admin) |
| Hosting FE | Firebase Hosting |
| Image hosting | ImageKit (CDN + Media Library) |
| Upload auth | Cloudflare Worker (menerbitkan signature ImageKit) |

Detail lengkap tech stack dan alasan pemilihannya akan dijelaskan dalam dokumen terpisah (`.md` sendiri).

---

## Struktur Proyek

```
.
├── src/                      # Frontend (React + Vite)
│   ├── app/                  # Entry & wiring: App.tsx, providers.tsx, router.tsx
│   ├── core/                 # Domain murni, tanpa dependensi eksternal
│   │   ├── types/            # Product, Category, Brand, dll
│   │   └── repositories/     # Interface repository (kontrak data)
│   ├── data/                 # Implementasi repository
│   │   ├── mock/             # In-memory (untuk demo/dev tanpa Firebase)
│   │   ├── firebase/         # Implementasi Firestore
│   │   └── fakestore/        # (legacy, tidak dipakai)
│   ├── services/             # DataProvider, cache, imagekit, imageService
│   ├── config/               # config dari .env (firebase, storage, imagekit)
│   ├── features/             # products, product-detail, admin, auth
│   ├── hooks/                # useRepository, useProducts, useAuth, dll
│   ├── components/           # UI primitif + layout
│   └── utils/                # formatters, categories, hash, imageUrl
│
├── imagekit-auth-worker/     # Cloudflare Worker: GET /signature (ImageKit auth)
├── scripts/                  # seed.cjs (isian data), resolve-image.cjs
├── public/assets/images/     # Gambar lokal legacy (produk lama)
├── firestore.rules           # Security rules Firestore
├── firebase.json             # Config Firebase (hosting + firestore)
├── .env / .env.example       # Konfigurasi environment
└── docs/ARCHITECTURE.md      # Penjelasan arsitektur lebih detail
```

---

## Konsep Arsitektur (baca ini dulu)

### 1. Repository pattern (kunci abstraksi)
Semua akses data melalui **interface** di `src/core/repositories/`:

```
src/core/repositories/product.repository.ts   # ProductRepository
src/core/repositories/category.repository.ts  # CategoryRepository
src/core/repositories/brand.repository.ts     # BrandRepository
```

Implementasinya bisa ditukar tanpa menyentuh UI:
- `src/data/mock/` — in-memory (mode tanpa Firebase)
- `src/data/firebase/` — Firestore (produksi)
- `src/services/cached-*.repository.ts` — pembungkus cache di atas keduanya

Pemilihan dilakukan di `src/app/providers.tsx` (satu-satunya tempat). Komponen mengakses lewat `useRepository()`.

> **Pindah ke backend sendiri (VPS)?** Cukup buat implementasi interface baru (mis. `src/data/api/...`) lalu ganti wiring di `providers.tsx`. UI tidak berubah sama sekali.

### 2. Resolusi gambar
Semua tampilan gambar lewat `src/services/imageService.ts` / `src/utils/imageUrl.ts`. Resolver sudah menangani **dua jenis key**:
- Path lokal: `assets/images/products/...` → di-serve dari hosting
- URL penuh ImageKit: `https://ik.imagekit.io/...` → pass-through langsung (CDN)

Jadi UI tidak peduli gambar di mana disimpan.

### 3. ImageKit upload
Browser **upload langsung ke ImageKit** — file tidak pernah lewat backend. Yang dibutuhkan:
1. **Signature** dari Cloudflare Worker (`GET /signature`) — private key hanya di sini
2. `imagekit-javascript` SDK mengirim file + signature ke `upload.imagekit.io`

Lihat `src/services/imagekit.ts` dan `imagekit-auth-worker/src/index.ts`.

---

## Alur Data & Upload

### User biasa lihat katalog
```
Browser → Firebase Hosting (statis)
       → baca products/categories/brands dari Firestore (public read)
       → gambar: path lokal (hosting) atau URL ImageKit (CDN)
```

### Admin upload gambar + create produk
```
ProductForm pilih file
  → ① fetch GET /signature (Cloudflare Worker, cek Origin allowlist)
  → ② POST file ke upload.imagekit.io (folder products/{category}/)
  → ③ simpan URL hasil upload ke form.images[i]
  → submit → tulis ke Firestore products/{id} (butuh login admin)
```

---

## Cara Menjalankan

### Prasyarat
- Node.js 18+ (repo punya `flake.nix` kalau pakai Nix)
- Firebase CLI: `firebase login`
- Akun ImageKit + private key (untuk worker)

### 1. Setup environment
```bash
cp .env.example .env        # lalu isi nilai di .env
npm install
```

### 2. Development (local)
Jalankan **dua terminal**:

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev

# Terminal 2 — Cloudflare Worker (http://localhost:8787)
cd imagekit-auth-worker
npm install
cp .dev.vars.example .dev.vars   # isi IMAGEKIT_PRIVATE_KEY dengan private key ImageKit
npm run dev
```

Saat dev, set di `.env`:
```
VITE_IMAGEKIT_AUTH_ENDPOINT="http://localhost:8787/signature"
```

> **Mock vs Firebase:** kalau `VITE_FIREBASE_PROJECT_ID` kosong, aplikasi memakai mock data (tanpa Firestore). Isi project ID untuk memakai Firestore sungguhan.

### 3. Production / Deploy
```bash
# 3a. Deploy Cloudflare Worker
cd imagekit-auth-worker
npm run deploy                      # → https://imagekit-auth-worker.faiqemilzzz.workers.dev

# 3b. Build + deploy Frontend
cd ..
npm run build
firebase deploy --only hosting
```

Sebelum deploy FE, pastikan:
- `VITE_IMAGEKIT_AUTH_ENDPOINT` = URL worker (bukan localhost)
- Domain FE sudah masuk `ALLOWED_ORIGINS` di `imagekit-auth-worker/wrangler.jsonc`

### 4. Seed data (opsional)
```bash
# Butuh scripts/service-account.json (jangan di-commit)
node scripts/seed.cjs --dry-run     # simulasi dulu
node scripts/seed.cjs               # tulis ke Firestore
```

---

## Konfigurasi Environment

Lihat `.env.example` untuk daftar lengkap. Variabel utama:

| Variabel | Fungsi |
|---|---|
| `VITE_FIREBASE_PROJECT_ID` | Isi → pakai Firestore. Kosong → mock data |
| `VITE_IMAGEKIT_PUBLIC_KEY` | Public key ImageKit (aman di FE) |
| `VITE_IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/{imagekit-id}` |
| `VITE_IMAGEKIT_AUTH_ENDPOINT` | URL endpoint signature (worker/VPS) |
| `VITE_ALLOWED_HOSTS` | Host yang diizinkan Vite dev server |

---

## Firestore & Security Rules

Rules ada di `firestore.rules`, berlaku untuk 3 koleksi (`products`, `categories`, `brands`):
- `read`: publik
- `create/update/delete`: butuh `request.auth != null` (login)

**Setelah mengubah rules, wajib deploy:**
```bash
firebase deploy --only firestore:rules
```

> Catatan: `scripts/seed.cjs` memakai Firebase Admin SDK (service account) sehingga **mengabaikan rules**. Itu normal — seed memang lewat jalur server.

---

## Catatan Penting / Gotchas

- **Private key ImageKit hanya ada di dua tempat**: secret Cloudflare (`wrangler secret put IMAGEKIT_PRIVATE_KEY`) dan `.dev.vars` lokal. Jangan pernah taruh di `.env`/kode FE.
- **SDK `imagekit-javascript` versi terbaru** tidak lagi menerima `authenticationEndpoint` di constructor — signature di-fetch manual lalu di-pass ke `upload()`. Lihat `src/services/imagekit.ts`.
- **Dokumen Firestore tidak menyimpan field `id`** — id produk = nama dokumen. Jangan tulis `id: undefined` ke Firestore (SDK melempar error).
- **URL workers.dev** formatnya `<nama-worker>.<subdomain-akun>.workers.dev`, bukan `<subdomain>.workers.dev`.
- Pola folder ImageKit: `products/{category}/` (menyamakan pola folder lokal).
- Admin memakai Firebase Auth Email/Password; `AdminLayout` otomatis redirect ke `/admin/login`.
- Vite dipecah chunk manual (`vendor`, `firebase`) di `vite.config.ts` — firebase dimuat terpisah agar cache lama tetap valid.
- `docs/ARCHITECTURE.md` adalah versi detail arsitektur (bahasa Inggris) — baca setelah memahami README ini.

---

## Dokumentasi Lain

- `docs/ARCHITECTURE.md` — arsitektur & struktur folder detail
- `.agents/skills/` — skill/resource Firebase (opencode) untuk memudahkan kerja dengan Firebase
