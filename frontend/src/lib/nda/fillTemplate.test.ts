import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultNdaFormData, type NdaFormData } from "./types";
import {
  deriveStandardTermsValues,
  extractCoverPageFooter,
  extractCoverPageIntro,
  fillStandardTerms,
  formatDate,
} from "./fillTemplate";

const templatesDir = path.join(__dirname, "../../../../templates");
const standardTermsSource = fs.readFileSync(
  path.join(templatesDir, "Mutual-NDA.md"),
  "utf-8"
);
const coverPageSource = fs.readFileSync(
  path.join(templatesDir, "Mutual-NDA-coverpage.md"),
  "utf-8"
);

describe("formatDate", () => {
  it("formats an ISO date as a long-form date", () => {
    expect(formatDate("2026-01-05")).toBe("January 5, 2026");
  });

  it("returns an empty string for an empty input", () => {
    expect(formatDate("")).toBe("");
  });
});

describe("deriveStandardTermsValues", () => {
  it("phrases a fixed MNDA term in years", () => {
    const form: NdaFormData = {
      ...defaultNdaFormData,
      mndaTerm: "expires",
      mndaTermYears: "2",
    };
    expect(deriveStandardTermsValues(form)["MNDA Term"]).toBe(
      "2 years from the Effective Date"
    );
  });

  it("uses singular 'year' for a term of one", () => {
    const form: NdaFormData = {
      ...defaultNdaFormData,
      confidentialityTerm: "fixed",
      confidentialityTermYears: "1",
    };
    expect(deriveStandardTermsValues(form)["Term of Confidentiality"]).toBe(
      "1 year from the Effective Date"
    );
  });

  it("phrases an open-ended MNDA term without a year count", () => {
    const form: NdaFormData = { ...defaultNdaFormData, mndaTerm: "continues" };
    expect(deriveStandardTermsValues(form)["MNDA Term"]).toBe(
      "date the MNDA is terminated in accordance with its terms"
    );
  });

  it("phrases a perpetual confidentiality term", () => {
    const form: NdaFormData = {
      ...defaultNdaFormData,
      confidentialityTerm: "perpetual",
    };
    expect(deriveStandardTermsValues(form)["Term of Confidentiality"]).toBe(
      "perpetuity"
    );
  });

  it("trims free-text fields", () => {
    const form: NdaFormData = {
      ...defaultNdaFormData,
      purpose: "  Evaluate a partnership.  ",
      governingLaw: " Delaware ",
    };
    const values = deriveStandardTermsValues(form);
    expect(values.Purpose).toBe("Evaluate a partnership.");
    expect(values["Governing Law"]).toBe("Delaware");
  });
});

describe("fillStandardTerms", () => {
  it("fills every coverpage_link span with its matching value", () => {
    const values = deriveStandardTermsValues({
      ...defaultNdaFormData,
      purpose: "Evaluate a partnership.",
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
    });

    const filled = fillStandardTerms(standardTermsSource, values);

    expect(filled).not.toContain('<span class="coverpage_link">');
    expect(filled).toContain(
      '<span class="mnda-blank">Evaluate a partnership.</span>'
    );
    expect(filled).toContain('<span class="mnda-blank">Delaware</span>');
    expect(filled).toContain(
      '<span class="mnda-blank">New Castle, DE</span>'
    );
  });

  it("marks unfilled fields as empty blanks showing the field name", () => {
    const values = deriveStandardTermsValues({
      ...defaultNdaFormData,
      governingLaw: "",
    });

    const filled = fillStandardTerms(standardTermsSource, values);

    expect(filled).toContain(
      '<span class="mnda-blank mnda-blank--empty">Governing Law</span>'
    );
  });

  it("keeps the surrounding legal text untouched", () => {
    const values = deriveStandardTermsValues(defaultNdaFormData);
    const filled = fillStandardTerms(standardTermsSource, values);
    expect(filled).toContain("Common Paper Mutual Non-Disclosure Agreement");
    expect(filled).toContain("**Equitable Relief**");
  });
});

describe("extractCoverPageIntro", () => {
  it("extracts the 'USING THIS...' paragraph verbatim", () => {
    const intro = extractCoverPageIntro(coverPageSource);
    expect(intro).toContain("This Mutual Non-Disclosure Agreement");
    expect(intro).toContain("Cover Page");
  });
});

describe("extractCoverPageFooter", () => {
  it("extracts the closing attribution line", () => {
    const footer = extractCoverPageFooter(coverPageSource);
    expect(footer).toContain("Common Paper Mutual Non-Disclosure Agreement");
    expect(footer).toContain("CC BY 4.0");
  });
});
