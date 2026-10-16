/// <reference types="vite/client" />

/**
 * Env boundary: `import.meta.env` must only be read inside `src/config/*`,
 * `src/app/composition.ts`, and `vite.config.ts`. Features, hooks, and
 * components consume `src/config/*` or the composition root instead.
 */
interface ImportMetaEnv {
  // Site/presentation (owner: src/config/site.ts)
  readonly VITE_STORE_NAME: string;
  readonly VITE_COMPANY_NAME: string;
  readonly VITE_ADMIN_NUMBER: string;
  readonly VITE_CS1_NUMBER: string;
  readonly VITE_CS2_NUMBER: string;
  readonly VITE_SOCIAL_WA: string;
  readonly VITE_SOCIAL_IG: string;
  readonly VITE_SOCIAL_FB: string;
  // Image display (owner: src/config/storage.ts)
  readonly VITE_STORAGE_PROVIDER: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_PLACEHOLDER_IMAGE_URL: string;
  readonly VITE_COMPANY_LOGO_IMAGE_URL: string;
  readonly VITE_ALLOWED_HOSTS: string;
  readonly VITE_S3_BUCKET: string;
  readonly VITE_S3_REGION: string;
  readonly VITE_CLOUDFLARE_ACCOUNT_ID: string;
  readonly VITE_CLOUDFLARE_BUCKET: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  // Image upload (owner: src/config/imagekit.ts)
  readonly VITE_IMAGEKIT_PUBLIC_KEY: string;
  readonly VITE_IMAGEKIT_URL_ENDPOINT: string;
  readonly VITE_IMAGEKIT_AUTH_ENDPOINT: string;
  // Firebase (owner: src/config/firebase.ts)
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // VPS API backend base URL (owner: src/config/api.ts).
  // Empty → Firebase stays the backend for everything. Set it to run on the
  // API; opt individual concerns out with the two switches below for a
  // staged cutover.
  readonly VITE_API_BASE_URL: string;
  // Per-concern backend overrides: 'firebase' | 'api'.
  // Default when VITE_API_BASE_URL is set: 'api'.
  readonly VITE_AUTH_BACKEND: string;
  readonly VITE_MEDIA_BACKEND: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
