const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '..', 'public', 'assets', 'images', 'products');
const PREFERRED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

/**
 * Resolve the actual image file path for a product image.
 * Checks preferred extensions in order and returns the first match.
 *
 * @param {string} category - Product category slug (e.g., "television")
 * @param {string} stem - Image filename without extension (e.g., "pld-24v1855")
 * @returns {string} Full relative path with correct extension
 *
 * Example:
 *   resolveImage('television', 'pld-24v1855')
 *   // => 'assets/images/products/television/pld-24v1855.webp'
 *   // (if .webp missing, tries .jpg → .jpeg → .png)
 *   // (if nothing found, falls back to .jpg)
 */
function resolveImage(category, stem) {
  const baseDir = path.join(IMAGE_DIR, category);
  const baseName = stem;

  for (const ext of PREFERRED_EXTENSIONS) {
    const filePath = path.join(baseDir, baseName + ext);
    if (fs.existsSync(filePath)) {
      return `assets/images/products/${category}/${baseName}${ext}`;
    }
  }

  console.warn(`  ⚠ Image not found: ${category}/${baseName}, using .jpg fallback`);
  return `assets/images/products/${category}/${baseName}.jpg`;
}

module.exports = { resolveImage };
