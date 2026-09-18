import type { GenericFormData } from "./fillGenericTemplate";

export type GenericFieldsPatch = Record<string, string | null | undefined>;

/** Applies the fields the AI just extracted on top of the document already built, field-by-field. */
export function mergeGenericFields(
  current: GenericFormData,
  patch: GenericFieldsPatch
): GenericFormData {
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value != null) next[key] = value;
  }
  return next;
}
