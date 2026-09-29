/**
 * Storage configuration using Vite environment variables.
 *
 * Supported providers: `local` (default) and `imagekit` (active, see
 * `.env.example`). `s3`, `cloudflare`, and `cloudinary` below are legacy
 * code paths kept for backwards compatibility only — do not add new
 * providers here (see issue #1 non-goals).
 *
 * To use this, create a .env file in the project root with:
 *
 * VITE_STORAGE_PROVIDER=local|imagekit
 * VITE_CDN_BASE_URL=https://your-cdn.com
 * VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
 *
 * For local development, VITE_STORAGE_PROVIDER=local is the default.
 */

/** Supported: `local` | `imagekit`. Others are legacy (deprecated). */
export type StorageProvider = 'local' | 'imagekit' | 's3' | 'cloudflare' | 'cloudinary';

export interface StorageConfig {
  provider: StorageProvider;
  cdnBaseUrl: string;
  placeholderImageUrl: string;
  storeName: string;
  companyName: string;
  /** @deprecated Legacy S3 path; do not use for new code. */
  s3Bucket?: string;
  /** @deprecated Legacy S3 path; do not use for new code. */
  s3Region?: string;
  /** @deprecated Legacy Cloudflare R2 path; do not use for new code. */
  cloudflareAccountId?: string;
  /** @deprecated Legacy Cloudflare R2 path; do not use for new code. */
  cloudflareBucket?: string;
  /** @deprecated Legacy Cloudinary path; do not use for new code. */
  cloudinaryCloudName?: string;
  /** @deprecated Legacy Cloudinary path; do not use for new code. */
  cloudinaryUploadPreset?: string;
  // ImageKit specific
  imagekitUrlEndpoint?: string;
  companyLogoUrl?: string;
}

function getEnvVar(key: string, defaultValue = ''): string {
  // Vite exposes env variables on import.meta.env
  // TypeScript needs declaration in vite-env.d.ts
  return (import.meta.env as Record<string, string | undefined>)[key] ?? defaultValue;
}

export const storageConfig: StorageConfig = {
  provider: (getEnvVar('VITE_STORAGE_PROVIDER') as StorageProvider) || 'local',
  cdnBaseUrl: getEnvVar('VITE_CDN_BASE_URL', ''),
  placeholderImageUrl: getEnvVar('VITE_PLACEHOLDER_IMAGE_URL', '/images/placeholder.jpg'),
  storeName: getEnvVar('VITE_STORE_NAME', 'Elvan Electronic'),
  companyName: getEnvVar('VITE_COMPANY_NAME', 'Kinarya Adika Askari'),
  s3Bucket: getEnvVar('VITE_S3_BUCKET'),
  s3Region: getEnvVar('VITE_S3_REGION'),
  cloudflareAccountId: getEnvVar('VITE_CLOUDFLARE_ACCOUNT_ID'),
  cloudflareBucket: getEnvVar('VITE_CLOUDFLARE_BUCKET'),
  cloudinaryCloudName: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME'),
  cloudinaryUploadPreset: getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET'),
  imagekitUrlEndpoint: getEnvVar('VITE_IMAGEKIT_URL_ENDPOINT'),
  companyLogoUrl: getEnvVar('VITE_COMPANY_LOGO_IMAGE_URL', '/assets/images/company_logo.png'),
};

export const isLocalStorage = storageConfig.provider === 'local';
/** @deprecated Legacy path; only `local` and `imagekit` are supported. */
export const isS3Storage = storageConfig.provider === 's3';
/** @deprecated Legacy path; only `local` and `imagekit` are supported. */
export const isCloudflareStorage = storageConfig.provider === 'cloudflare';
/** @deprecated Legacy path; only `local` and `imagekit` are supported. */
export const isCloudinaryStorage = storageConfig.provider === 'cloudinary';
export const isImageKitStorage = storageConfig.provider === 'imagekit';