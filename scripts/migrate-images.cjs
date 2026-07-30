const admin = require('firebase-admin');
const path = require('path');
const { resolveImage } = require('./resolve-image.cjs');

const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!require('fs').existsSync(serviceAccountPath)) {
  console.error('❌ File scripts/service-account.json tidak ditemukan!');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  const snapshot = await db.collection('products').get();
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const originalImages = data.images || [];

    const resolvedImages = originalImages.map((img) => {
      const ext = path.extname(img);
      const stem = path.basename(img, ext);
      return resolveImage(data.category, stem);
    });

    const changed = originalImages.some((img, i) => img !== resolvedImages[i]);

    if (changed) {
      await doc.ref.update({ images: resolvedImages });
      updated++;
      console.log(`  ✓ ${data.name}`);
      console.log(`    before: ${originalImages.join(', ')}`);
      console.log(`    after:  ${resolvedImages.join(', ')}`);
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ Done! ${updated} updated, ${skipped} already correct.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
