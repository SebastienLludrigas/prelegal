/**
 * Generic `_link` span parsing shared by every document except the Mutual NDA
 * (which keeps its own hand-written field list). Mirrors backend/src/backend/
 * documents.py's `extract_field_names` / `slugify_field_name` — the two must
 * stay in sync by hand, the same way the NDA's field lists already do on both
 * sides.
 */

const LINK_PATTERN = /<span class="\w+_link">([^<]+)<\/span>/g;
const POSSESSIVE_SUFFIX = /[’']s$/;
const WORD_PATTERN = /[A-Za-z0-9]+/g;

/** Unique field display names referenced by `_link` spans, in first-seen order. */
export function extractFieldNames(templateText: string): string[] {
  const seen = new Set<string>();
  for (const match of templateText.matchAll(LINK_PATTERN)) {
    const canonical = match[1].replace(POSSESSIVE_SUFFIX, "").trim();
    seen.add(canonical);
  }
  return [...seen];
}

/** Turns a field's display name into a camelCase key, e.g. "Effective Date" -> "effectiveDate". */
export function slugifyFieldName(name: string): string {
  const words = name.match(WORD_PATTERN) ?? [];
  const [first, ...rest] = words;
  if (!first) return "field";
  return (
    first.toLowerCase() +
    rest.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join("")
  );
}
