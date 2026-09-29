/**
 * Application-level image upload contract.
 *
 * Feature code (forms, hooks) must depend on this interface only — never
 * on the ImageKit SDK or the signature-endpoint details. The current
 * implementation is `ImageKitUploadService` (`src/services/imagekit.ts`);
 * pointing the signature endpoint at a VPS backend later does not change
 * this contract (see issue #1).
 *
 * Signature-endpoint contract (infrastructure detail, not imported by
 * features):
 * - `GET {VITE_IMAGEKIT_AUTH_ENDPOINT}` -> `{ token, expire, signature }`
 * - `DELETE {origin}/files` with `{ fileIds }` -> `{ deleted }`
 *   (the auth backend holds the private key; today a Cloudflare Worker,
 *   later any backend with the same contract).
 *
 * Storage contract:
 * - `uploadProductImage` returns a provider-independent relative key
 *   (e.g. `assets/images/products/television/example.jpg`, no leading
 *   slash) to store in the database, plus the provider `fileId` needed
 *   for later deletion.
 * - Display code resolves keys to full URLs via the image service; the
 *   database never stores absolute URLs.
 */
export interface UploadProductImageOptions {
  file: File;
  category: string;
  slug?: string;
}

export interface UploadProductImageResult {
  key: string;
  fileId: string;
}

export interface ImageUploadService {
  readonly maxImageSizeMB: number;
  uploadProductImage(
    options: UploadProductImageOptions
  ): Promise<UploadProductImageResult>;
  deleteProductImages(fileIds: string[]): Promise<{ deleted: number }>;
}

export const MAX_IMAGE_SIZE_MB = 20;
