/**
 * Migrate local product images to ImageKit.
 *
 * Uploads every file under public/assets/images/products/ to ImageKit into the
 * SAME relative folder, so the stored DB keys (assets/images/products/...) keep
 * working. Then scans Firestore for any product image key that already points
 * into ImageKit but not under assets/images/products/ (legacy full-URL or
 * products/... keys), copies the file to the canonical folder and rewrites the
 * key.
 *
 * PRIVATE KEY: The ImageKit private key is read from IMAGEKIT_PRIVATE_KEY.
 *   IMAGEKIT_PRIVATE_KEY=private_xxx node scripts/migrate-to-imagekit.cjs
 * (the key also lives in imagekit-auth-worker/.dev.vars as
 * IMAGEKIT_PRIVATE_KEY=private_xxx — copy it from there.)
 *
 * Firestore is updated via scripts/service-account.json, same as
 * migrate-images.cjs.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('❌ Set IMAGEKIT_PRIVATE_KEY (private_xxx) sebagai env var dulu.');
  process.exit(1);
}

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_API_URL = 'https://api.imagekit.io/v1';
const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'assets', 'images', 'products');

function basicAuth() {
  return 'Basic ' + Buffer.from(`${PRIVATE_KEY}:`).toString('base64');
}

async function uploadFile(absolutePath, folder, fileName) {
  const buffer = fs.readFileSync(absolutePath);
  const form = new FormData();
  form.append('file', new Blob([buffer]), fileName);
  form.append('fileName', fileName);
  form.append('folder', folder);
  form.append('useUniqueFileName', 'false');
  form.append('overwriteFile', 'true');

  const res = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: basicAuth() },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload ${folder}/${fileName} failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.filePath.replace(/^\//, '');
}

async function copyFile(sourceFilePath, destinationPath) {
  const res = await fetch(`${IMAGEKIT_API_URL}/files/copy`, {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceFilePath,
      destinationPath,
      includeFileVersions: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (!res.ok && !text.includes('already exists')) {
      throw new Error(`Copy ${sourceFilePath} failed: ${res.status} ${text}`);
    }
  }
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.gitkeep') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

async function migrateLocalFiles() {
  const files = walk(PRODUCTS_DIR);
  if (files.length === 0) {
    console.log('  (tidak ada file lokal untuk di-upload)');
    return;
  }

  for (const file of files) {
    const rel = path.relative(PRODUCTS_DIR, file);
    const folder = path.join('assets/images/products', path.dirname(rel)).replace(/\\/g, '/');
    const fileName = path.basename(rel);
    const key = await uploadFile(file, folder, fileName);
    console.log(`  ✓ ${key}`);
  }
}

async function migrateFirestoreKeys() {
  const serviceAccountPath = path.join(__dirname, 'service-account.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.log('  (skip: scripts/service-account.json tidak ada untuk update Firestore)');
    return;
  }

  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const snapshot = await db.collection('products').get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const originalImages = data.images || [];
    const newImages = [];

    for (const key of originalImages) {
      // Full URL -> take the path after the endpoint host.
      const match = key.match(/^https?:\/\/[^/]+\/(.+)$/);
      const cleanKey = (match ? match[1] : key).replace(/^\//, '');

      if (cleanKey.startsWith('assets/images/products/')) {
        newImages.push(cleanKey);
        continue;
      }

      if (cleanKey.startsWith('products/')) {
        const dest = cleanKey.replace(/^products\//, 'assets/images/products/');
        await copyFile(cleanKey, dest);
        newImages.push(dest);
        console.log(`  ⇢ ${key} -> ${dest}`);
        continue;
      }

      console.log(`  ? key tak dikenal, dibiarkan: ${key}`);
      newImages.push(key);
    }

    const changed = originalImages.some((img, i) => img !== newImages[i]);
    if (changed) {
      await doc.ref.update({ images: newImages });
      updated++;
    }
  }

  console.log(`  Firestore: ${updated} dokumen di-update.`);
}

async function main() {
  console.log('Migrasi 1/2 — upload file lokal ke ImageKit...');
  await migrateLocalFiles();

  console.log('Migrasi 2/2 — rapikan key legacy di Firestore...');
  await migrateFirestoreKeys();

  console.log('\n✅ Selesai. Cek hasil di dashboard ImageKit dan pastikan katalog tampil.');
}

main().catch((err) => {
  console.error('Migrasi gagal:', err);
  process.exit(1);
});
