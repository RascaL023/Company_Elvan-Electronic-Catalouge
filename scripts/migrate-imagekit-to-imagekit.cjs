/**
 * Migrate ImageKit account: copy all product images from an old account to a
 * new account while preserving the EXACT relative folder/file layout, so the
 * stored Firestore keys (assets/images/products/...) keep working unchanged.
 *
 * Usage:
 *   IMAGEKIT_PRIVATE_KEY=<old> IMAGEKIT_PRIVATE_KEY_NEW=<new> \
 *     node scripts/migrate-imagekit-to-imagekit.cjs
 *
 * Output:
 *   scripts/imagekit-fileid-map.json  => { "<key>": "<newFileId>", ... }
 *   (gitignored; used later by migrate-firestore.cjs to remap imageFileIds)
 */

const fs = require('fs');
const path = require('path');

const OLD_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const NEW_KEY = process.env.IMAGEKIT_PRIVATE_KEY_NEW;
if (!OLD_KEY || !NEW_KEY) {
  console.error('❌ Set IMAGEKIT_PRIVATE_KEY (old) dan IMAGEKIT_PRIVATE_KEY_NEW (new) sebagai env var dulu.');
  process.exit(1);
}

const IMAGEKIT_API_URL = 'https://api.imagekit.io/v1';
const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const PRODUCT_ROOT = process.env.IMAGEKIT_PRODUCT_ROOT || 'assets/images/products';
const MAP_PATH = path.join(__dirname, 'imagekit-fileid-map.json');

function basicAuth(key) {
  return 'Basic ' + Buffer.from(`${key}:`).toString('base64');
}

async function listAllFiles(apiKey) {
  const files = [];
  const pageSize = 1000;
  let skip = 0;

  // Current API returns a plain array, paginated via skip/limit.
  for (;;) {
    const params = new URLSearchParams({
      path: PRODUCT_ROOT,
      limit: String(pageSize),
      skip: String(skip),
    });

    const res = await fetch(`${IMAGEKIT_API_URL}/files?${params.toString()}`, {
      headers: { Authorization: basicAuth(apiKey), Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`List files failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    const rawPage = Array.isArray(data) ? data : (data.files ?? data.items ?? []);
    // Only actual files (folder entries have no fileId/filePath).
    const page = rawPage.filter(
      (f) => f && typeof f.fileId === 'string' && typeof f.filePath === 'string'
    );
    files.push(...page);
    console.log(`  halaman ${skip / pageSize + 1}: ${page.length} file (total ${files.length})`);

    if (page.length < pageSize) break;
    skip += pageSize;
  }

  return files;
}

async function downloadFile(file) {
  // Files are public (isPrivateFile: false); the list API exposes file.url.
  const res = await fetch(file.url);
  if (!res.ok) {
    throw new Error(`Download ${file.filePath} failed: ${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToNew(buffer, folder, fileName) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), fileName);
  form.append('fileName', fileName);
  form.append('folder', folder);
  form.append('useUniqueFileName', 'false');
  form.append('overwriteFile', 'true');

  const res = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: basicAuth(NEW_KEY) },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload ${folder}/${fileName} failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return { key: data.filePath.replace(/^\//, ''), fileId: data.fileId };
}

async function main() {
  console.log('1/2 — List file dari akun LAMA...');
  const files = await listAllFiles(OLD_KEY);
  console.log(`\nTotal ${files.length} file untuk dimigrasi.\n`);

  if (files.length === 0) {
    console.log('  (tidak ada file — keluar)');
    process.exit(0);
  }

  const map = {};
  if (fs.existsSync(MAP_PATH)) {
    Object.assign(map, JSON.parse(fs.readFileSync(MAP_PATH, 'utf8')));
    console.log(`  (map lama dimuat: ${Object.keys(map).length} entri)\n`);
  }
  let ok = 0;
  let failed = 0;

  console.log('2/2 — Download + upload ke akun BARU...');
  for (const file of files) {
    const filePath = file.filePath.replace(/^\//, '');
    const cleanKey = filePath.startsWith(`${PRODUCT_ROOT}/`)
      ? filePath
      : `${PRODUCT_ROOT}/${path.posix.basename(filePath)}`;

    try {
      const buffer = await downloadFile(file);
      const folder = path.posix.dirname(cleanKey);
      const fileName = path.posix.basename(cleanKey);
      const result = await uploadToNew(buffer, folder, fileName);
      map[result.key] = result.fileId;
      ok++;
      console.log(`  ✓ ${result.key}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${filePath}: ${err.message}`);
    }
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
  console.log(`\n✅ Selesai: ${ok} sukses, ${failed} gagal.`);
  console.log(`Mapping fileId disimpan ke ${MAP_PATH}`);
}

main().catch((err) => {
  console.error('Migrasi gagal:', err);
  process.exit(1);
});
