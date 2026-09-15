import type { NdaFormData } from "./types";

export type StandardTermsField =
  | "Purpose"
  | "Effective Date"
  | "MNDA Term"
  | "Term of Confidentiality"
  | "Governing Law"
  | "Jurisdiction";

const COVERPAGE_LINK_PATTERN =
  /<span class="coverpage_link">([^<]+)<\/span>/g;

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function pluralYears(years: string): string {
  const value = years.trim();
  const n = Number(value);
  const unit = Number.isFinite(n) && Math.abs(n) === 1 ? "year" : "years";
  return `${value || "0"} ${unit}`;
}

export function deriveStandardTermsValues(
  form: NdaFormData
): Record<StandardTermsField, string> {
  return {
    Purpose: form.purpose.trim(),
    "Effective Date": formatDate(form.effectiveDate),
    "MNDA Term":
      form.mndaTerm === "expires"
        ? `${pluralYears(form.mndaTermYears)} from the Effective Date`
        : "date the MNDA is terminated in accordance with its terms",
    "Term of Confidentiality":
      form.confidentialityTerm === "fixed"
        ? `${pluralYears(form.confidentialityTermYears)} from the Effective Date`
        : "perpetuity",
    "Governing Law": form.governingLaw.trim(),
    Jurisdiction: form.jurisdiction.trim(),
  };
}

/**
 * Replaces every `coverpage_link` span in the Standard Terms markdown with
 * the corresponding form value, keeping the Standard Terms text itself
 * verbatim from templates/Mutual-NDA.md.
 */
export function fillStandardTerms(
  raw: string,
  values: Record<StandardTermsField, string>
): string {
  return raw.replace(COVERPAGE_LINK_PATTERN, (match, field: string) => {
    const key = field as StandardTermsField;
    const value = values[key];
    const filled = Boolean(value && value.trim().length > 0);
    const display = filled ? value : field;
    const className = filled ? "mnda-blank" : "mnda-blank mnda-blank--empty";
    return `<span class="${className}">${display}</span>`;
  });
}

/** Pulls the "USING THIS..." intro paragraph straight from the Cover Page source. */
export function extractCoverPageIntro(raw: string): string {
  const match = raw.match(
    /## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT\s*\n+([\s\S]*?)\n+### Purpose/
  );
  return match ? match[1].trim() : "";
}

/** Pulls the closing attribution line straight from the Cover Page source. */
export function extractCoverPageFooter(raw: string): string {
  const lines = raw
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0);
  return lines.length > 0 ? lines[lines.length - 1].trim() : "";
}
