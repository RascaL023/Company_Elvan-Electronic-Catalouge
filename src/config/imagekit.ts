/**
 * ImageKit configuration using Vite environment variables.
 *
 * VITE_IMAGEKIT_PUBLIC_KEY=public_key_from_imagekit_dashboard
 * VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
 * VITE_IMAGEKIT_AUTH_ENDPOINT=http://localhost:8787/signature
 *
 * The auth endpoint is intentionally a plain URL: it can be swapped for any
 * backend (Cloudflare Worker today, VPS later) that implements the same
 * contract without touching feature code (see `ImageUploadService`):
 * - GET {VITE_IMAGEKIT_AUTH_ENDPOINT} -> { token, expire, signature }
 * - DELETE {origin}/files with { fileIds } -> { deleted }
 */

export interface ImageKitConfig {
  publicKey: string;
  urlEndpoint: string;
  authEndpoint: string;
}

function getEnvVar(key: string, defaultValue = ''): string {
  return (import.meta.env as Record<string, string | undefined>)[key] ?? defaultValue;
}

export const imagekitConfig: ImageKitConfig = {
  publicKey: getEnvVar('VITE_IMAGEKIT_PUBLIC_KEY'),
  urlEndpoint: getEnvVar('VITE_IMAGEKIT_URL_ENDPOINT'),
  authEndpoint: getEnvVar('VITE_IMAGEKIT_AUTH_ENDPOINT'),
};

export const isImageKitConfigured = Boolean(
  imagekitConfig.publicKey && imagekitConfig.urlEndpoint && imagekitConfig.authEndpoint,
);
