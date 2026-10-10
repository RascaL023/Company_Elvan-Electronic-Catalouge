/**
 * Ekspor koleksi Firestore ke satu file JSON format `ARCHITECTURE §16.1`
 * (repo BE), siap diimpor `cmd/importer`.
 *
 * Ini BUKAN `migrate-firestore.cjs`: yang itu menyalin data antar dua project
 * Firebase (Admin SDK), sedangkan skrip ini hanya MEMBACA Firestore dan
 * menulis JSON dengan `legacy_id` = id dokumen.
 *
 * Skrip ini juga menjalankan PREFLIGHT yang meniru aturan validasi BE
 * (domain.Category/Brand/Product + UNIQUE slug) supaya masalah data ketahuan
 * sebelum impor, bukan saat transaksi berjalan.
 *
 * Usage:
 *   node scripts/export-firestore.cjs [--out <path>] [--normalize]
 *
 * Opsi:
 *   --out <path>   tujuan file JSON (default: scripts/export-firestore.json)
 *   --normalize    rapikan slug yang tidak valid & buat slug unik SAAT EKSPOR,
 *                  tanpa mengubah Firestore. Referensi category/brand pada
 *                  produk ikut disesuaikan. Semua perubahan dicetak.
 *
 * Prasyarat: scripts/service-account.json (project yang datanya mau dipindah).
 *
 * Alur lengkap:
 *   node scripts/export-firestore.cjs --normalize
 *   importer import --input export-firestore.json --dry-run
 *   importer import --input export-firestore.json
 *   importer verify
 *
 * Exit code 1 bila preflight masih menemukan masalah yang akan DITOLAK
 * importer (file tetap ditulis supaya bisa diperiksa).
 */

const fs = require('fs');
const path = require('path');

const SA_PATH = path.join(__dirname, 'service-account.json');
const DEFAULT_OUT = path.join(__dirname, 'export-firestore.json');
const COLLECTIONS = ['categories', 'brands', 'products'];

// Sama persis dengan domain.slugRE di repo BE.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseArgs(argv) {
  let out = DEFAULT_OUT;
  let normalize = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) {
      out = path.resolve(argv[i + 1]);
      i++;
    } else if (argv[i] === '--normalize') {
      normalize = true;
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node scripts/export-firestore.cjs [--out <path>] [--normalize]');
      process.exit(0);
    }
  }
  return { out, normalize };
}

/** Sama persis dengan domain.Slugify di repo BE. */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Firestore Timestamp / Date / string / null -> ISO-8601 ('' bila kosong). */
function toIso(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch {
      return '';
    }
  }
  if (typeof value._seconds === 'number') {
    return new Date(value._seconds * 1000).toISOString();
  }
  return '';
}

function asString(value) {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return '';
  return String(value);
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => asString(entry));
}

function asInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapCategory(id, data) {
  return {
    legacy_id: id,
    name: asString(data.name),
    slug: asString(data.slug),
    description: asString(data.description),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function mapBrand(id, data) {
  return {
    legacy_id: id,
    name: asString(data.name),
    slug: asString(data.slug),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function mapProduct(id, data) {
  return {
    legacy_id: id,
    name: asString(data.name),
    slug: asString(data.slug),
    price: asInt(data.price),
    description: asString(data.description),
    category: asString(data.category),
    brand: asString(data.brand), // '' = tanpa brand (importer melewati validasi brand)
    images: asStringArray(data.images),
    imageFileIds: asStringArray(data.imageFileIds), // array paralel (index sama dengan images)
    rating: {
      rate: asNumber(data.rating && data.rating.rate),
      count: asInt(data.rating && data.rating.count),
    },
    isActive: data.isActive === undefined ? true : Boolean(data.isActive),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

/**
 * Rapikan slug agar lolos aturan BE, dan jadikan unik. Dipakai oleh
 * `--normalize`; mengembalikan daftar perubahan (untuk dicetak, tidak ada
 * perubahan yang senyap).
 */
function normalizeDataset(dataset) {
  const changes = [];

  // 1. Kategori: slugify + unik. Simpan peta slug lama -> baru.
  const categoryMap = new Map();
  const usedCategories = new Set();
  dataset.categories.forEach((c, i) => {
    const original = c.slug;
    const base = slugify(original);
    if (!base) {
      changes.push(`categories[${i}] (${c.legacy_id}): slug ${JSON.stringify(original)} tidak bisa dinormalkan`);
      return;
    }
    let candidate = base;
    let n = 1;
    while (usedCategories.has(candidate)) {
      n++;
      candidate = `${base}-${n}`;
    }
    usedCategories.add(candidate);
    categoryMap.set(original, candidate);
    if (candidate !== original) {
      changes.push(`kategori "${c.name}" (${c.legacy_id}): slug ${JSON.stringify(original)} -> ${JSON.stringify(candidate)}`);
      c.slug = candidate;
    }
  });

  // 2. Brand: slugify + unik. Simpan peta slug lama -> baru.
  const brandMap = new Map();
  const usedBrands = new Set();
  dataset.brands.forEach((b, i) => {
    const original = b.slug;
    const base = slugify(original);
    if (!base) {
      changes.push(`brands[${i}] (${b.legacy_id}): slug ${JSON.stringify(original)} tidak bisa dinormalkan`);
      return;
    }
    let candidate = base;
    let n = 1;
    while (usedBrands.has(candidate)) {
      n++;
      candidate = `${base}-${n}`;
    }
    usedBrands.add(candidate);
    brandMap.set(original, candidate);
    if (candidate !== original) {
      changes.push(`brand "${b.name}" (${b.legacy_id}): slug ${JSON.stringify(original)} -> ${JSON.stringify(candidate)}`);
      b.slug = candidate;
    }
  });

  // 3. Produk: slugify + unik.
  const usedProducts = new Set();
  dataset.products.forEach((p, i) => {
    const original = p.slug;
    const base = slugify(original);
    if (!base) {
      changes.push(`products[${i}] (${p.legacy_id}): slug ${JSON.stringify(original)} tidak bisa dinormalkan`);
      return;
    }
    let candidate = base;
    let n = 1;
    while (usedProducts.has(candidate)) {
      n++;
      candidate = `${base}-${n}`;
    }
    usedProducts.add(candidate);
    if (candidate !== original) {
      changes.push(`produk "${p.name}" (${p.legacy_id}): slug ${JSON.stringify(original)} -> ${JSON.stringify(candidate)}`);
      p.slug = candidate;
    }
  });

  // 4. Ikutkan referensi category/brand pada produk ke slug baru, kalau tidak
  //    produk akan menunjuk kategori yang tidak ada.
  dataset.products.forEach((p) => {
    if (p.category && categoryMap.has(p.category) && categoryMap.get(p.category) !== p.category) {
      changes.push(`produk "${p.name}" (${p.legacy_id}): category ${JSON.stringify(p.category)} -> ${JSON.stringify(categoryMap.get(p.category))}`);
      p.category = categoryMap.get(p.category);
    }
    if (p.brand && brandMap.has(p.brand) && brandMap.get(p.brand) !== p.brand) {
      changes.push(`produk "${p.name}" (${p.legacy_id}): brand ${JSON.stringify(p.brand)} -> ${JSON.stringify(brandMap.get(p.brand))}`);
      p.brand = brandMap.get(p.brand);
    }
  });

  return changes;
}

/**
 * Preflight: meniru aturan yang akan dipakai importer + UNIQUE constraint
 * Postgres, supaya kegagalan impor bisa dicegah lebih awal.
 */
function preflight(dataset) {
  const errors = [];

  dataset.categories.forEach((c, i) => {
    const ref = `categories[${i}] (${c.legacy_id})`;
    if (!c.legacy_id.trim()) errors.push(`${ref}: legacy_id kosong`);
    if (!c.name.trim()) errors.push(`${ref}: name kosong`);
    if (!SLUG_RE.test(c.slug)) errors.push(`${ref}: slug tidak valid ${JSON.stringify(c.slug)}`);
  });

  dataset.brands.forEach((b, i) => {
    const ref = `brands[${i}] (${b.legacy_id})`;
    if (!b.legacy_id.trim()) errors.push(`${ref}: legacy_id kosong`);
    if (!b.name.trim()) errors.push(`${ref}: name kosong`);
    if (!SLUG_RE.test(b.slug)) errors.push(`${ref}: slug tidak valid ${JSON.stringify(b.slug)}`);
  });

  const categorySlugs = new Set(dataset.categories.map((c) => c.slug));
  dataset.products.forEach((p, i) => {
    const ref = `products[${i}] (${p.legacy_id})`;
    if (!p.legacy_id.trim()) errors.push(`${ref}: legacy_id kosong`);
    if (!p.name.trim()) errors.push(`${ref}: name kosong`);
    if (!SLUG_RE.test(p.slug)) errors.push(`${ref}: slug tidak valid ${JSON.stringify(p.slug)}`);
    if (!p.category.trim()) errors.push(`${ref}: category kosong`);
    else if (!categorySlugs.has(p.category)) errors.push(`${ref}: category tidak ada di daftar kategori: ${JSON.stringify(p.category)}`);
    if (p.price < 0) errors.push(`${ref}: price harus >= 0`);
    if (p.rating.rate < 0 || p.rating.rate > 5) errors.push(`${ref}: rating.rate harus 0..5 (${p.rating.rate})`);
    if (p.rating.count < 0) errors.push(`${ref}: rating.count harus >= 0`);
  });

  // UNIQUE (legacy_id idempoten; slug unik di Postgres).
  const checkUnique = (collection, docs, field) => {
    const seen = new Map();
    docs.forEach((d, i) => {
      const key = d[field];
      if (!key) return;
      if (seen.has(key)) {
        errors.push(`${collection}: ${field} duplikat ${JSON.stringify(key)} pada item #${seen.get(key)} dan #${i} -> akan melanggar constraint UNIQUE`);
      } else {
        seen.set(key, i);
      }
    });
  };
  checkUnique('categories', dataset.categories, 'legacy_id');
  checkUnique('brands', dataset.brands, 'legacy_id');
  checkUnique('products', dataset.products, 'legacy_id');
  checkUnique('categories', dataset.categories, 'slug');
  checkUnique('brands', dataset.brands, 'slug');
  checkUnique('products', dataset.products, 'slug');

  return errors;
}

async function main() {
  const { out, normalize } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(SA_PATH)) {
    console.error(`❌ ${SA_PATH} tidak ditemukan.`);
    process.exit(1);
  }

  const { initializeApp, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');

  const account = require(SA_PATH);
  const app = initializeApp({ credential: cert(account) }, 'export');
  const db = getFirestore(app, 'default');

  console.log(`📤 Ekspor Firestore project: ${account.project_id}`);

  const dataset = {
    sourceProject: account.project_id,
    exportedAt: new Date().toISOString(),
    normalized: normalize,
    categories: [],
    brands: [],
    products: [],
    catalog_snapshot: {},
  };

  const [categorySnap, brandSnap, productSnap] = await Promise.all(
    COLLECTIONS.map((name) => db.collection(name).get())
  );

  categorySnap.forEach((doc) => dataset.categories.push(mapCategory(doc.id, doc.data())));
  brandSnap.forEach((doc) => dataset.brands.push(mapBrand(doc.id, doc.data())));
  productSnap.forEach((doc) => dataset.products.push(mapProduct(doc.id, doc.data())));

  // catalog/snapshot hanya proyeksi; importer mengabaikannya, tapi kita ikutkan
  // supaya file mencerminkan kondisi Firestore apa adanya.
  try {
    const snapshotDoc = await db.collection('catalog').doc('snapshot').get();
    if (snapshotDoc.exists) dataset.catalog_snapshot = snapshotDoc.data();
  } catch {
    // Dokumen tidak ada / gagal dibaca: biarkan {} — tidak dipakai importer.
  }

  await app.delete();

  if (normalize) {
    const changes = normalizeDataset(dataset);
    if (changes.length > 0) {
      console.log(`\n🛠  --normalize: ${changes.length} penyesuaian (Firestore tidak diubah):`);
      changes.forEach((c) => console.log(`   - ${c}`));
    } else {
      console.log('\n🛠  --normalize: tidak ada yang perlu diubah.');
    }
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(dataset, null, 2));

  const sizeKb = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`\n✅ Ekspor selesai: ${out} (${sizeKb} KB)`);
  console.log(`   categories: ${dataset.categories.length}`);
  console.log(`   brands:     ${dataset.brands.length}`);
  console.log(`   products:   ${dataset.products.length}`);
  console.log(`   images:     ${dataset.products.reduce((n, p) => n + p.images.length, 0)}`);

  const errors = preflight(dataset);
  if (errors.length > 0) {
    console.warn(`\n❌ PREFLIGHT: ${errors.length} masalah — importer akan MENOLAK file ini:`);
    errors.forEach((e) => console.warn(`   - ${e}`));
    console.warn('\nCoba tambahkan --normalize, atau perbaiki data di Firestore.');
    process.exit(1);
  }
  console.log('\n✅ PREFLIGHT OK: file siap diimpor ke BE.');
}

main().catch((err) => {
  console.error('Ekspor gagal:', err);
  process.exit(1);
});
