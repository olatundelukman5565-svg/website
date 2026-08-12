import slugify from "slugify";

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = toSlug(base) || "item";
  let candidate = baseSlug;
  let counter = 2;
  while (await exists(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return candidate;
}
