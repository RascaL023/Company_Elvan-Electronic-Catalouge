/**
 * ImageKit Service
 *
 * Handles direct browser uploads to ImageKit (no backend involvement).
 * Stored image keys are full ImageKit URLs, which the existing
 * getImageUrl() resolver already passes through unchanged, so every
 * display component works without modification (hybrid local + remote).
 *
 * The signature is fetched from VITE_IMAGEKIT_AUTH_ENDPOINT, which only
 * needs to implement GET /signature -> { token, expire, signature }.
 * Swapping backends (Cloudflare Worker -> VPS) is a single env change.
 */

import ImageKit from 'imagekit-javascript';
import { imagekitConfig, isImageKitConfigured } from '../config/imagekit';
import { toSlug } from '../utils/hash';

export interface UploadProductImageOptions {
  file: File;
  category: string;
  slug?: string;
}

export const MAX_IMAGE_SIZE_MB = 20;

interface SignatureResponse {
  token: string;
  expire: number;
  signature: string;
}

function getImageKitClient(): ImageKit {
  if (!isImageKitConfigured) {
    throw new Error(
      'ImageKit is not configured. Set VITE_IMAGEKIT_PUBLIC_KEY, VITE_IMAGEKIT_URL_ENDPOINT and VITE_IMAGEKIT_AUTH_ENDPOINT.',
    );
  }
  return new ImageKit({
    publicKey: imagekitConfig.publicKey,
    urlEndpoint: imagekitConfig.urlEndpoint,
  });
}

async function getSignature(): Promise<SignatureResponse> {
  if (!imagekitConfig.authEndpoint) {
    throw new Error('VITE_IMAGEKIT_AUTH_ENDPOINT is not configured');
  }
  const response = await fetch(imagekitConfig.authEndpoint);
  if (!response.ok) {
    throw new Error(`Signature request failed with status ${response.status}`);
  }
  const data = (await response.json()) as SignatureResponse;
  if (!data.token || !data.expire || !data.signature) {
    throw new Error('Invalid signature response from auth endpoint');
  }
  return data;
}

function getFileExtension(file: File): string {
  const fromName = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
  if (fromName) {
    return `.${fromName}`;
  }
  const fromType = file.type.split('/')[1]?.toLowerCase();
  if (fromType) {
    return `.${fromType === 'jpeg' ? 'jpg' : fromType}`;
  }
  return '.jpg';
}

/**
 * Upload a product image to ImageKit.
 * Folder mirrors the existing seed pattern: products/{category}/
 * File name mirrors the slug pattern: {slug}.{ext}
 * Returns the full ImageKit URL to store as the image key.
 */
export async function uploadProductImage({ file, category, slug }: UploadProductImageOptions): Promise<string> {
  const baseName = slug || toSlug(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const folder = `products/${toSlug(category) || 'misc'}`;
  const { token, expire, signature } = await getSignature();

  const response = await getImageKitClient().upload({
    file,
    fileName: `${baseName}${getFileExtension(file)}`,
    folder,
    useUniqueFileName: true,
    isPrivateFile: false,
    signature,
    token,
    expire,
  });
  return response.url;
}

export const ImageKitService = {
  uploadProductImage,
  maxImageSizeMB: MAX_IMAGE_SIZE_MB,
};

export default ImageKitService;
