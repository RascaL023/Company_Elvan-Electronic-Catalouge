/**
 * ImageKit implementation of the application-level image upload contract.
 *
 * Implements `ImageUploadService` (`src/core/services/image-upload.service.ts`).
 * Handles direct browser uploads to ImageKit (no backend involvement).
 * Stored image keys are relative paths following the existing seed pattern:
 *   assets/images/products/{category}/{slug}.{ext}
 *
 * The display resolver (getImageUrl / resolveImageUrl) maps those keys to
 * full ImageKit URLs with transforms, so the database stays provider-agnostic.
 *
 * The signature is fetched from VITE_IMAGEKIT_AUTH_ENDPOINT, which only
 * needs to implement GET /signature -> { token, expire, signature }.
 * Swapping backends (Cloudflare Worker -> VPS) is a single env change.
 */

import ImageKit from 'imagekit-javascript';
import { imagekitConfig, isImageKitConfigured } from '../config/imagekit';
import { toSlug } from '../utils/hash';
import type {
  ImageUploadService,
  UploadProductImageOptions,
  UploadProductImageResult,
} from '../core/services/image-upload.service';
import { MAX_IMAGE_SIZE_MB } from '../core/services/image-upload.service';

export type { UploadProductImageOptions };

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
 * Folder mirrors the existing seed pattern: assets/images/products/{category}/
 * File name mirrors the slug pattern: {slug}.{ext}
 * Returns both the relative key to store in the DB (no leading slash) and the
 * ImageKit fileId (needed to delete the file later).
 */
export async function uploadProductImage({ file, category, slug }: UploadProductImageOptions): Promise<UploadProductImageResult> {
  const baseName = slug || toSlug(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const folder = `assets/images/products/${toSlug(category) || 'misc'}`;
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
  return {
    key: response.filePath.replace(/^\//, ''),
    fileId: response.fileId,
  };
}

/**
 * Delete product images from ImageKit.
 * Delegates the actual deletion to the auth backend (e.g. Cloudflare Worker)
 * which holds the private key. Returns { deleted } count.
 */
export async function deleteProductImages(fileIds: string[]): Promise<{ deleted: number }> {
  if (!imagekitConfig.authEndpoint) {
    throw new Error('VITE_IMAGEKIT_AUTH_ENDPOINT is not configured');
  }
  const base = new URL(imagekitConfig.authEndpoint).origin;
  const response = await fetch(`${base}/files`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileIds }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Delete failed with status ${response.status}: ${text}`);
  }
  return (await response.json()) as { deleted: number };
}

export const ImageKitService: ImageUploadService = {
  maxImageSizeMB: MAX_IMAGE_SIZE_MB,
  uploadProductImage,
  deleteProductImages,
};

export class ImageKitUploadService implements ImageUploadService {
  readonly maxImageSizeMB = MAX_IMAGE_SIZE_MB;

  uploadProductImage(
    options: UploadProductImageOptions
  ): Promise<UploadProductImageResult> {
    return uploadProductImage(options);
  }

  deleteProductImages(fileIds: string[]): Promise<{ deleted: number }> {
    return deleteProductImages(fileIds);
  }
}

export { MAX_IMAGE_SIZE_MB };

export default ImageKitService;
