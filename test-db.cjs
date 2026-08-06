const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const newAccount = require('./scripts/service-account-new.json');

async function test() {
  const app = initializeApp({ credential: cert(newAccount) });
  
  // Try default
  try {
    const db1 = getFirestore(app);
    await db1.collection('test').doc('test').get();
    console.log("Success with getFirestore(app)");
  } catch (err) {
    console.error("Error with getFirestore(app):", err.code, err.message);
  }

  // Try explicitly naming it '(default)'
  try {
    const db2 = getFirestore(app, '(default)');
    await db2.collection('test').doc('test').get();
    console.log("Success with getFirestore(app, '(default)')");
  } catch (err) {
    console.error("Error with getFirestore(app, '(default)'):", err.code, err.message);
  }

  // Try 'default' without parentheses
  try {
    const db3 = getFirestore(app, 'default');
    await db3.collection('test').doc('test').get();
    console.log("Success with getFirestore(app, 'default')");
  } catch (err) {
    console.error("Error with getFirestore(app, 'default'):", err.code, err.message);
  }
}
test();
