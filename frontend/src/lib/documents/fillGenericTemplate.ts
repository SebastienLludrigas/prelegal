import { slugifyFieldName } from "./fields";

const LINK_PATTERN = /<span class="\w+_link">([^<]+)<\/span>/g;
const POSSESSIVE_SUFFIX = /[’']s$/;

export type GenericFormData = Record<string, string>;

/**
 * Replaces every `_link` span in a generic document's Standard Terms markdown
 * with the corresponding field value, keeping a possessive suffix ("Provider's")
 * attached to the filled value. Mirrors `fillStandardTerms` in lib/nda/fillTemplate.ts,
 * generalized to all `_link` classes instead of just `coverpage_link`.
 */
export function fillGenericTemplate(raw: string, values: GenericFormData): string {
  return raw.replace(LINK_PATTERN, (match, text: string) => {
    const possessiveMatch = text.match(POSSESSIVE_SUFFIX);
    const suffix = possessiveMatch ? possessiveMatch[0] : "";
    const canonical = (suffix ? text.slice(0, -suffix.length) : text).trim();
    const value = values[slugifyFieldName(canonical)];
    const filled = Boolean(value && value.trim().length > 0);
    const display = filled ? `${value}${suffix}` : text;
    const className = filled ? "mnda-blank" : "mnda-blank mnda-blank--empty";
    return `<span class="${className}">${display}</span>`;
  });
}
