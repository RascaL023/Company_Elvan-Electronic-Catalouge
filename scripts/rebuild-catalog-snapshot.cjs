/*
 * Rebuild the `catalog/snapshot` read model from `products/*`.
 *
 * The public catalog reads exactly ONE document (`catalog/snapshot`)
 * instead of every product. `products/*` remains the source of truth;
 * this script regenerates the projection. It is safe to run whenever the
 * snapshot is missing, stale, or after bulk Admin-SDK writes
 * (seed.cjs, migration scripts, manual console edits).
 *
 * Usage:
 *   node scripts/rebuild-catalog-snapshot.cjs
 *   npm run rebuild:catalog
 */
const fs = require('fs');
const path = require('path');

const CATALOG_COLLECTION = 'catalog';
const SNAPSHOT_DOC = 'snapshot';

/** ISO string for strings, Date and Firestore Timestamp values. */
function toIso(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return '';
}

/**
 * Project a canonical product document into the lightweight catalog
 * entry. Mirrors `toCatalogProduct` in `src/core/types/catalog.ts`
 * (kept in sync manually because this runs in Node with the Admin SDK).
 */
function toCatalogProduct(id, data) {
  const images = Array.isArray(data.images) ? data.images : [];
  return {
    id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    price: data.price ?? 0,
    category: data.category ?? '',
    brand: data.brand ?? '',
    thumbnail: images[0] ?? '',
    rating: {
      rate: data.rating?.rate ?? 0,
      count: data.rating?.count ?? 0,
    },
    isActive: data.isActive ?? true,
    createdAt: toIso(data.createdAt),
  };
}

/** Rebuild `catalog/snapshot` from the whole `products` collection. */
async function rebuildCatalogSnapshot(db) {
  const snapshot = await db.collection('products').get();
  const products = snapshot.docs.map((doc) => toCatalogProduct(doc.id, doc.data()));

  const ref = db.collection(CATALOG_COLLECTION).doc(SNAPSHOT_DOC);
  const existing = await ref.get();
  const version = existing.exists ? (existing.data().version || 0) + 1 : 1;

  await ref.set({
    version,
    updatedAt: new Date().toISOString(),
    products,
  });

  return products;
}

module.exports = { rebuildCatalogSnapshot, toCatalogProduct };

// Only initialize the Admin SDK when run directly (not when required by
// seed.cjs, which already has an initialized app).
if (require.main === module) {
  const serviceAccountPath = path.join(__dirname, 'service-account.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ File scripts/service-account.json tidak ditemukan!');
    console.error('Lihat scripts/seed.cjs untuk cara mendapatkannya.');
    process.exit(1);
  }

  const admin = require('firebase-admin');
  const serviceAccount = require(serviceAccountPath);
  const { getFirestore } = require('firebase-admin/firestore');

  const app = admin.initializeApp({ credential: admin.cert(serviceAccount) });
  // The project uses a named database called "default" (see firebase.json
  // and src/config/firebase.ts). The Admin SDK would otherwise target
  // "(default)", which does not exist here (NOT_FOUND).
  const db = getFirestore(app, 'default');

  rebuildCatalogSnapshot(db)
    .then((products) => {
      console.log(`✅ catalog/snapshot rebuilt (${products.length} products).`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Rebuild failed:', err);
      process.exit(1);
    });
}
