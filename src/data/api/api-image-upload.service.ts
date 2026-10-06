/**
 * `ImageUploadService` backed by the VPS API.
 *
 * The upload still goes straight from the browser to ImageKit (the file never
 * touches our backend) — only the **signature** now comes from
 * `GET /api/v1/media/signature`, which requires an admin session.
 *
 * Deletion is a no-op on purpose: the backend cleans ImageKit files
 * server-side when a product is deleted or images are removed via `PATCH`
 * (see docs/ARCHITECTURE.md §11). Keeping the method here means call sites
 * (`useDeleteProduct`, `ProductForm`) stay untouched and backend-agnostic.
 */

import ImageKit from 'imagekit-javascript';
import { imagekitConfig } from '../../config/imagekit';
import { toSlug } from '../../utils/hash';
import type {
  ImageUploadService,
  UploadProductImageOptions,
  UploadProductImageResult,
} from '../../core/services/image-upload.service';
import { MAX_IMAGE_SIZE_MB } from '../../core/services/image-upload.service';
import { apiRequest } from './http-client';
import type { SignatureDto } from './mappers';

function getFileExtension(file: File): string {
  const fromName = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
  if (fromName) return `.${fromName}`;
  const fromType = file.type.split('/')[1]?.toLowerCase();
  if (fromType) return `.${fromType === 'jpeg' ? 'jpg' : fromType}`;
  return '.jpg';
}

export class ApiImageUploadService implements ImageUploadService {
  readonly maxImageSizeMB = MAX_IMAGE_SIZE_MB;

  async uploadProductImage({
    file,
    category,
    slug,
  }: UploadProductImageOptions): Promise<UploadProductImageResult> {
    if (!imagekitConfig.publicKey || !imagekitConfig.urlEndpoint) {
      throw new Error(
        'ImageKit display config is missing (set VITE_IMAGEKIT_PUBLIC_KEY and VITE_IMAGEKIT_URL_ENDPOINT).'
      );
    }

    const baseName =
      slug || toSlug(file.name.replace(/\.[^.]+$/, '')) || 'image';
    const folder = `assets/images/products/${toSlug(category) || 'misc'}`;

    const { token, expire, signature } = await apiRequest<SignatureDto>(
      '/media/signature'
    );

    const client = new ImageKit({
      publicKey: imagekitConfig.publicKey,
      urlEndpoint: imagekitConfig.urlEndpoint,
    });

    const response = await client.upload({
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

  async deleteProductImages(_fileIds: string[]): Promise<{ deleted: number }> {
    // Handled server-side; see the file header.
    return { deleted: 0 };
  }
}
