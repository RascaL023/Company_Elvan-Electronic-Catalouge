const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ File scripts/service-account.json tidak ditemukan!');
  console.error('');
  console.error('Cara dapatkan:');
  console.error('1. Buka https://console.firebase.google.com');
  console.error('2. Project Settings > Service Accounts');
  console.error('3. "Generate New Private Key"');
  console.error('4. Simpan sebagai scripts/service-account.json');
  process.exit(1);
}

const admin = require('firebase-admin');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const products = [
  {
    name: 'Samsung RS64R5331B4 Side by Side Refrigerator 642L',
    slug: 'samsung-rs64r5331b4-side-by-side-refrigerator-642l',
    price: 15999000,
    description: 'Refrigerator Side by Side Samsung RS64R5331B4 dengan kapasitas 642L. Dilengkapi Digital Inverter Technology, Twin Cooling Plus, dan All-around Cooling.',
    category: 'refrigerator',
    images: ['assets/images/products/refrigator/Kulkas1.webp'],
    rating: { rate: 4.7, count: 234 },
    isActive: true,
  },
  {
    name: 'LG GN-B215SQMT 2 Door Refrigerator 215L',
    slug: 'lg-gn-b215sqmt-2-door-refrigerator-215l',
    price: 5499000,
    description: 'Kulkas 2 Pintu LG GN-B215SQMT dengan kapasitas 215L. Teknologi Smart Inverter Compressor.',
    category: 'refrigerator',
    images: ['assets/images/products/refrigator/Kulkas2.jpg'],
    rating: { rate: 4.5, count: 189 },
    isActive: true,
  },
  {
    name: 'Sharp SJ-317MG 1 Door Refrigerator 170L',
    slug: 'sharp-sj-317mg-1-door-refrigerator-170l',
    price: 2799000,
    description: 'Kulkas 1 Pintu Sharp SJ-317MG kapasitas 170L dengan teknologi Pendingin Cepat.',
    category: 'refrigerator',
    images: ['assets/images/products/refrigator/Kulkas3.jpg'],
    rating: { rate: 4.3, count: 156 },
    isActive: true,
  },
  {
    name: 'Samsung UA43TU8000 43" 4K Crystal UHD Smart TV',
    slug: 'samsung-ua43tu8000-43-4k-crystal-uhd-smart-tv',
    price: 6999000,
    description: 'Samsung 43-inch 4K UHD Smart TV dengan Crystal Display dan HDR.',
    category: 'television',
    images: ['assets/images/products/television/tv-samsung-43.jpg'],
    rating: { rate: 4.6, count: 312 },
    isActive: true,
  },
  {
    name: 'LG 55NANO756QA 55" 4K NanoCell Smart TV',
    slug: 'lg-55nano756qa-55-4k-nanocell-smart-tv',
    price: 10999000,
    description: 'LG 55-inch 4K NanoCell Smart TV dengan teknologi NanoCell.',
    category: 'television',
    images: ['assets/images/products/television/tv-lg-55.jpg'],
    rating: { rate: 4.5, count: 278 },
    isActive: true,
  },
  {
    name: 'Xiaomi Mi TV 4A 32" HD Ready Smart TV',
    slug: 'xiaomi-mi-tv-4a-32-hd-ready-smart-tv',
    price: 2899000,
    description: 'Xiaomi Mi TV 4A 32-inch HD Ready Smart TV dengan PatchWall UI.',
    category: 'television',
    images: ['assets/images/products/television/tv-xiaomi-32.jpg'],
    rating: { rate: 4.2, count: 445 },
    isActive: true,
  },
];

const categories = [
  { name: 'Kulkas', slug: 'refrigerator', description: 'Refrigerator dan freezer' },
  { name: 'Televisi', slug: 'television', description: 'Smart TV dan LED TV' },
  { name: 'Smartphone', slug: 'smartphone', description: 'Smartphone dan aksesoris' },
  { name: 'Mesin Cuci', slug: 'washing_machine', description: 'Mesin cuci front load dan top load' },
  { name: 'Mesin Jahit', slug: 'sewing_machine', description: 'Mesin jahit manual dan elektrik' },
];

async function seed() {
  const now = new Date().toISOString();

  console.log('Seeding categories...');
  const catRefs = {};
  for (const cat of categories) {
    const docRef = await db.collection('categories').add({
      ...cat,
      createdAt: now,
      updatedAt: now,
    });
    catRefs[cat.slug] = docRef.id;
    console.log(`  ✓ ${cat.name} (${docRef.id})`);
  }

  console.log('\nSeeding products...');
  for (const product of products) {
    const docRef = await db.collection('products').add({
      ...product,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ ${product.name} (${docRef.id})`);
  }

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
