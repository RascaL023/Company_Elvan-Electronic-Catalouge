import type { Category } from '../core/types/category';

/**
 * Category display helpers.
 *
 * A category carries two different things:
 * - `slug` — stable identity used in URLs and query params
 *   (`?category=washing-machine`), never shown to humans.
 * - `name` — the display label ("Mesin Cuci"), editable by admins.
 *
 * The slug → name mapping is **owned by the data** (the categories collection),
 * so it must not be hardcoded here: a category added or renamed in the admin
 * panel should show up correctly with no code change. Resolution lives in
 * `src/services/CategoryNameProvider.tsx`, which reads the categories through
 * the active repository (Firebase or the VPS API) and falls back to
 * {@link humanizeCategorySlug}.
 */

/**
 * Best-effort label for a slug whose category is unknown — e.g. while the
 * category list is still loading, or when a product points at a deleted
 * category. Returns a readable label instead of the raw slug:
 * `washing-machine` → `Washing Machine`, `Chest_Freezer` → `Chest Freezer`.
 */
export function humanizeCategorySlug(slug: string): string {
  const text = slug.replace(/[-_]+/g, ' ').trim();
  if (!text) return '';
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Resolve a category slug to the label that should be rendered. */
export type CategoryNameResolver = (slug: string) => string;

/**
 * Build a slug → name resolver from the category list of the active backend.
 *
 * Pure and framework-free so it can be exercised directly (and reused outside
 * React, e.g. in export scripts). The provider below wraps it in a memo.
 *
 * A slug missing from the list — categories still loading, a product pointing
 * at a deleted category, or an empty `name` — falls back to
 * {@link humanizeCategorySlug}, so the UI never shows a raw `washing-machine`.
 */
export function createCategoryNameResolver(
  categories: ReadonlyArray<Category>
): CategoryNameResolver {
  const namesBySlug = new Map(
    categories.map((category) => [category.slug, category.name])
  );
  return (slug: string) => namesBySlug.get(slug) || humanizeCategorySlug(slug);
}
