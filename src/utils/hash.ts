export function shortHash(input: string, length = 6): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, length);
}

export function generateProductId(brandSlug: string, categorySlug: string, name: string): string {
  const hash = shortHash(`${brandSlug}-${categorySlug}-${name}`);
  return `${brandSlug}-${categorySlug}-${hash}`;
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
