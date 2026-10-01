/** Converts a string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Generates a human-friendly, reasonably unique order number. */
export function generateOrderNumber(): string {
  const random = Math.floor(10000 + Math.random() * 89999);
  return `ORD-${random}`;
}
