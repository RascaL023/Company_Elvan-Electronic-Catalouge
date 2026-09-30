const { initializeApp, cert } = require('firebase-admin/app');
const { getProjectManagement } = require('firebase-admin/project-management');
const newAccount = require('./scripts/service-account-new.json');

async function setup() {
  const app = initializeApp({ credential: cert(newAccount) });
  const pm = getProjectManagement(app);
  
  try {
    console.log("Listing web apps...");
    const apps = await pm.listWebApps();
    let webApp;
    if (apps.length === 0) {
      console.log("Creating new web app...");
      webApp = await pm.createWebApp('electronic-catalog-web');
      console.log("App created.");
    } else {
      webApp = apps[0];
      console.log("App already exists.");
    }
    
    console.log("Getting config...");
    const config = await webApp.getConfig();
    console.log(JSON.stringify(config, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
setup();