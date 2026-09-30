import { getImageUrl, getImageUrlList, getPrimaryImageUrl, getThumbnailUrl, getMediumImageUrl, getDetailImageUrl } from '../utils/imageUrl';
import { storageConfig } from '../config/storage';

/**
 * Image Service
 * 
 * Higher-level image operations for components.
 * Provides a clean interface for components to work with product images.
 * 
 * This service abstracts the image URL resolution logic and provides
 * consistent methods for getting different image sizes.
 */

export const ImageService = {
  /**
   * Get the primary (first) image URL for a product
   */
  getPrimaryUrl(images: string[]): string {
    return getPrimaryImageUrl(images);
  },

  /**
   * Get all image URLs for a product
   */
  getAllUrls(images: string[]): string[] {
    return getImageUrlList(images);
  },

  /**
   * Get thumbnail URL for the primary image of a product
   */
  getPrimaryThumbnailUrl(images: string[] | undefined): string {
    if (!images || images.length === 0) {
      return storageConfig.placeholderImageUrl;
    }
    return getThumbnailUrl(images[0]);
  },

  /**
   * Get thumbnail URL (small, for listings)
   */
  getThumbnailUrl(key: string): string {
    return getThumbnailUrl(key);
  },

  /**
   * Get medium-sized URL (for product cards)
   */
  getMediumUrl(key: string): string {
    return getMediumImageUrl(key);
  },

  /**
   * Get detail-sized URL (for product detail page)
   */
  getDetailUrl(key: string): string {
    return getDetailImageUrl(key);
  },

  /**
   * Get original/full-sized URL
   */
  getOriginalUrl(key: string): string {
    return getImageUrl(key);
  },

  /**
   * Get URLs for all images in a product
   */
  getProductImageUrls(images: string[], size: 'thumbnail' | 'medium' | 'detail' | 'original' = 'medium'): string[] {
    if (!images || images.length === 0) {
      return [storageConfig.placeholderImageUrl];
    }

    const transformMap = {
      thumbnail: getThumbnailUrl,
      medium: getMediumImageUrl,
      detail: getDetailImageUrl,
      original: getImageUrl,
    };

    const transformFn = transformMap[size];
    return images.map((key) => transformFn(key));
  },
};

export default ImageService;