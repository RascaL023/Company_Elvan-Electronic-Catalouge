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
  // Future API backend base URL (NOT IMPLEMENTED — see issue #1).
  // When set, the composition root refuses to boot with a clear error
  // until ApiRepository adapters exist. Leave empty to use Firebase.
  // (owner: src/app/composition.ts)
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
