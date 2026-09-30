/*
 * Static verification of the Firestore catalog read path.
 *
 * The whole point of this change is that a public catalog load reads
 * ONE document (`catalog/snapshot`) instead of every product. This
 * script fails if the Firebase product repository regresses to a full
 * `products/*` query on the public read path, or stops syncing the
 * snapshot transactionally.
 *
 * Usage: npm run verify:catalog-read
 */
const fs = require('fs');
const path = require('path');

const repoFile = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'firebase',
  'firebase-product.repository.ts'
);
const src = fs.readFileSync(repoFile, 'utf8');

const errors = [];

// 1. getAll() (the public catalog read) must use getDoc on the snapshot.
const getAllStart = src.indexOf('async getAll(');
const listStart = src.indexOf('async list(');
if (getAllStart === -1 || listStart === -1) {
  errors.push('Tidak bisa menemukan getAll() / list() di repository.');
} else {
  const getAllBody = src.slice(getAllStart, listStart);
  if (!/getDoc\(/.test(getAllBody)) {
    errors.push('getAll() tidak memanggil getDoc() (seharusnya 1 read).');
  }
  if (/getDocs\(/.test(getAllBody)) {
    errors.push('getAll() masih memanggil getDocs() (baca seluruh koleksi).');
  }
  if (!/snapshotRef\(\)|SNAPSHOT_DOC/.test(getAllBody)) {
    errors.push('getAll() tidak membaca catalog/snapshot.');
  }
}

// 2. The ONLY full-collection query must live inside rebuildSnapshot().
const getDocsMatches = src.match(/getDocs\(/g) || [];
const rebuildIndex = src.indexOf('async rebuildSnapshot(');
const firstGetDocs = src.indexOf('getDocs(');
if (getDocsMatches.length !== 1) {
  errors.push(
    `Ditemukan ${getDocsMatches.length} pemanggilan getDocs(); seharusnya hanya 1 (di rebuildSnapshot).`
  );
}
if (rebuildIndex === -1 || firstGetDocs < rebuildIndex) {
  errors.push('getDocs() ditemukan di luar rebuildSnapshot().');
}

// 3. Product mutations must keep the snapshot in sync atomically.
if (!/runTransaction\(/.test(src)) {
  errors.push('Mutasi produk tidak memakai runTransaction (snapshot bisa jadi stale).');
}

// 4. Catalog/rebuild script must define the snapshot document.
const rebuildScript = path.join(__dirname, 'rebuild-catalog-snapshot.cjs');
if (!fs.existsSync(rebuildScript)) {
  errors.push('scripts/rebuild-catalog-snapshot.cjs tidak ditemukan.');
} else {
  const script = fs.readFileSync(rebuildScript, 'utf8');
  if (!/'catalog'/.test(script) || !/'snapshot'/.test(script)) {
    errors.push('Script rebuild tidak menulis ke catalog/snapshot.');
  }
}

if (errors.length > 0) {
  console.error('❌ Verifikasi jalur baca katalog GAGAL:');
  for (const err of errors) console.error('   - ' + err);
  process.exit(1);
}

console.log('✅ Jalur baca katalog OK: publik = getDoc(catalog/snapshot); mutasi = transaksional.');
