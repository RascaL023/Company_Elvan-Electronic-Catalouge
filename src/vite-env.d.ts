/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORE_NAME: string;
  readonly VITE_COMPANY_NAME: string;
  readonly VITE_STORAGE_PROVIDER: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_PLACEHOLDER_IMAGE_URL: string;
  readonly VITE_ALLOWED_HOSTS: string;
  readonly VITE_S3_BUCKET: string;
  readonly VITE_S3_REGION: string;
  readonly VITE_CLOUDFLARE_ACCOUNT_ID: string;
  readonly VITE_CLOUDFLARE_BUCKET: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // Future API backend base URL (NOT IMPLEMENTED — see issue #1).
  // When set, the composition root refuses to boot with a clear error
  // until ApiRepository adapters exist. Leave empty to use Firebase.
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
