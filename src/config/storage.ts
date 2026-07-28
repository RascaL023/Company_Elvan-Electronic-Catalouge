/**
 * Storage configuration using Vite environment variables.
 * 
 * To use this, create a .env file in the project root with:
 * 
 * VITE_STORAGE_PROVIDER=local|s3|cloudflare
 * VITE_CDN_BASE_URL=https://your-cdn.com
 * VITE_S3_BUCKET=your-bucket-name
 * VITE_S3_REGION=us-east-1
 * VITE_CLOUDFLARE_ACCOUNT_ID=your-account-id
 * VITE_CLOUDFLARE_BUCKET=your-bucket-name
 * 
 * For local development, VITE_STORAGE_PROVIDER=local is the default.
 */

export type StorageProvider = 'local' | 's3' | 'cloudflare' | 'cloudinary';

export interface StorageConfig {
  provider: StorageProvider;
  cdnBaseUrl: string;
  // S3 specific
  s3Bucket?: string;
  s3Region?: string;
  // Cloudflare specific
  cloudflareAccountId?: string;
  cloudflareBucket?: string;
  // Cloudinary specific
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}

function getEnvVar(key: string, defaultValue = ''): string {
  // Vite exposes env variables on import.meta.env
  // TypeScript needs declaration in vite-env.d.ts
  return (import.meta.env as Record<string, string | undefined>)[key] ?? defaultValue;
}

export const storageConfig: StorageConfig = {
  provider: (getEnvVar('VITE_STORAGE_PROVIDER') as StorageProvider) || 'local',
  cdnBaseUrl: getEnvVar('VITE_CDN_BASE_URL', ''),
  s3Bucket: getEnvVar('VITE_S3_BUCKET'),
  s3Region: getEnvVar('VITE_S3_REGION'),
  cloudflareAccountId: getEnvVar('VITE_CLOUDFLARE_ACCOUNT_ID'),
  cloudflareBucket: getEnvVar('VITE_CLOUDFLARE_BUCKET'),
  cloudinaryCloudName: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME'),
  cloudinaryUploadPreset: getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET'),
};

export const isLocalStorage = storageConfig.provider === 'local';
export const isS3Storage = storageConfig.provider === 's3';
export const isCloudflareStorage = storageConfig.provider === 'cloudflare';
export const isCloudinaryStorage = storageConfig.provider === 'cloudinary';