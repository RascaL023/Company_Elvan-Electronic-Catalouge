import { storageConfig, isLocalStorage, isS3Storage, isCloudflareStorage, isCloudinaryStorage } from '../config/storage';

/**
 * Image URL utilities for different storage providers.
 * 
 * Key concepts:
 * - For local: uses /assets/ or /images/ path
 * - For S3: uses https://bucket.s3.region.amazonaws.com/ or custom CDN
 * - For Cloudflare: uses https://{accountId}.r2.cloudflarestorage.com/ or custom domain
 * - For Cloudinary: uses https://res.cloudinary.com/{cloudName}/image/upload/
 * 
 * Image keys in the database are stored as relative paths (e.g., "products/refrigerator-1.jpg")
 * or as Cloudinary public IDs (e.g., "products/refrigerator-1").
 */

/**
 * Get the local asset path for local development.
 * In Vite, public assets are served from the root.
 */
function getLocalAssetPath(key: string): string {
  // Remove leading slash if present
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  // For Vite, images in public/ are served at root
  // If using src/assets, they'd be imported differently
  // We assume images are in public/images/ or public/assets/
  return `/${cleanKey}`;
}

/**
 * Generate S3 URL
 */
function getS3Url(key: string): string {
  const { cdnBaseUrl, s3Bucket, s3Region } = storageConfig;
  
  // If custom CDN is configured, use it
  if (cdnBaseUrl) {
    return `${cdnBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  
  // Default S3 URL pattern
  const bucket = s3Bucket || 'your-bucket';
  const region = s3Region || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Generate Cloudflare R2 URL
 */
function getCloudflareUrl(key: string): string {
  const { cdnBaseUrl, cloudflareAccountId, cloudflareBucket } = storageConfig;
  
  // If custom CDN domain is configured
  if (cdnBaseUrl) {
    return `${cdnBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  
  // Default R2 URL pattern (uses custom domain or r2.dev)
  const accountId = cloudflareAccountId || 'your-account-id';
  const bucket = cloudflareBucket || 'your-bucket';
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
}

/**
 * Generate Cloudinary URL
 */
function getCloudinaryUrl(key: string, options?: { width?: number; height?: number; quality?: string }): string {
  const { cloudinaryCloudName } = storageConfig;
  const cloudName = cloudinaryCloudName || 'your-cloud-name';
  
  // Cloudinary uses public IDs without extension
  // The key might already be a public ID (without extension)
  const publicId = key.replace(/\.[^.]+$/, ''); // Remove extension if present
  
  let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  
  // Add transformations if provided
  if (options?.width || options?.height || options?.quality) {
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    else transformations.push('q_auto');
    transformations.push('f_auto'); // Auto format
    url += `${transformations.join(',')}/`;
  }
  
  url += publicId;
  return url;
}

/**
 * Get the full URL for a single image key.
 * 
 * @param key - The image key/path stored in the database (e.g., "products/fridge-1.jpg")
 * @param options - Optional transformation options for supported providers
 * @returns Full URL to the image
 * 
 * Usage:
 *   getImageUrl('products/fridge-1.jpg')
 *   getImageUrl('products/fridge-1', { width: 400, height: 300 })
 */
export function getImageUrl(key: string, options?: { width?: number; height?: number; quality?: string }): string {
  if (!key) {
    return '/images/placeholder.jpg';
  }
  
  // If it's already a full URL, return as-is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  
  if (isLocalStorage) {
    return getLocalAssetPath(key);
  }
  
  if (isS3Storage) {
    return getS3Url(key);
  }
  
  if (isCloudflareStorage) {
    return getCloudflareUrl(key);
  }
  
  if (isCloudinaryStorage) {
    return getCloudinaryUrl(key, options);
  }
  
  // Fallback to local
  return getLocalAssetPath(key);
}

/**
 * Get URLs for a list of image keys.
 * 
 * @param keys - Array of image keys
 * @param options - Optional transformation options
 * @returns Array of full image URLs
 * 
 * Usage:
 *   getImageUrlList(['products/fridge-1.jpg', 'products/fridge-2.jpg'])
 *   getImageUrlList(product.images)
 */
export function getImageUrlList(keys: string[], options?: { width?: number; height?: number; quality?: string }): string[] {
  if (!keys || keys.length === 0) {
    return ['/images/placeholder.jpg'];
  }
  return keys.map(key => getImageUrl(key, options));
}

/**
 * Get the primary image URL from a product's images array.
 * Returns the first image or placeholder if empty.
 */
export function getPrimaryImageUrl(images: string[], options?: { width?: number; height?: number; quality?: string }): string {
  if (!images || images.length === 0) {
    return '/images/placeholder.jpg';
  }
  return getImageUrl(images[0], options);
}

/**
 * Get thumbnail URL for a product (smaller version for listings)
 */
export function getThumbnailUrl(key: string): string {
  return getImageUrl(key, { width: 400, height: 300, quality: '70' });
}

/**
 * Get medium-sized image URL for product cards
 */
export function getMediumImageUrl(key: string): string {
  return getImageUrl(key, { width: 800, height: 600, quality: '80' });
}

/**
 * Get full-sized image URL for product detail view
 */
export function getDetailImageUrl(key: string): string {
  return getImageUrl(key, { width: 1200, height: 900, quality: '90' });
}

/**
 * Resolve image key to URL based on storage provider.
 * This is the main export for components to use.
 */
export const resolveImageUrl = getImageUrl;
export const resolveImageUrlList = getImageUrlList;
export const resolvePrimaryImageUrl = getPrimaryImageUrl;
export const resolveThumbnailUrl = getThumbnailUrl;
export const resolveMediumImageUrl = getMediumImageUrl;
export const resolveDetailImageUrl = getDetailImageUrl;

export default {
  getImageUrl,
  getImageUrlList,
  getPrimaryImageUrl,
  getThumbnailUrl,
  getMediumImageUrl,
  getDetailImageUrl,
};