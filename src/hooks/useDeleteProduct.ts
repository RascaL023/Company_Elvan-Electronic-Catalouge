import { useCallback } from 'react';
import { useRepository } from './useRepository';
import { imageUploadService } from '../app/composition';

export interface DeleteProductResult {
  deletedImages: number;
  failedImages: number;
}

/**
 * Delete a product and clean up its ImageKit files.
 *
 * Takes an `id` (the admin list now works with the lightweight
 * `CatalogProduct`, which does not carry `imageFileIds`). The full
 * product is read once to know which files to delete.
 */
export function useDeleteProduct() {
  const { productRepository } = useRepository();

  const deleteProduct = useCallback(
    async (id: string): Promise<DeleteProductResult> => {
      const product = await productRepository.getById(id);
      await productRepository.delete(id);

      const fileIds = (product?.imageFileIds ?? []).filter((fileId) => fileId !== '');
      if (fileIds.length === 0) {
        return { deletedImages: 0, failedImages: 0 };
      }

      try {
        const { deleted } = await imageUploadService.deleteProductImages(fileIds);
        return {
          deletedImages: deleted,
          failedImages: fileIds.length - deleted,
        };
      } catch {
        return { deletedImages: 0, failedImages: fileIds.length };
      }
    },
    [productRepository]
  );

  return { deleteProduct };
}
