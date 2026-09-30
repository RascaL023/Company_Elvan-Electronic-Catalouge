import { useCallback } from 'react';
import { Product } from '../core/types/product';
import { useRepository } from './useRepository';
import { ImageKitService } from '../services/imagekit';

export interface DeleteProductResult {
  deletedImages: number;
  failedImages: number;
}

export function useDeleteProduct() {
  const { productRepository } = useRepository();

  const deleteProduct = useCallback(
    async (product: Product): Promise<DeleteProductResult> => {
      await productRepository.delete(product.id);

      const fileIds = (product.imageFileIds ?? []).filter((id) => id !== '');
      if (fileIds.length === 0) {
        return { deletedImages: 0, failedImages: 0 };
      }

      try {
        const { deleted } = await ImageKitService.deleteProductImages(fileIds);
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
