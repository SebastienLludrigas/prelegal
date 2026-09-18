import { describe, expect, it } from "vitest";
import { extractFieldNames, slugifyFieldName } from "./fields";

describe("extractFieldNames", () => {
  it("dedupes fields and strips a trailing possessive", () => {
    const template =
      '<span class="keyterms_link">Provider</span> and ' +
      '<span class="keyterms_link">Provider\'s</span> obligations, ' +
      '<span class="keyterms_link">Company</span>, ' +
      '<span class="header_2">Not a field</span>';

    expect(extractFieldNames(template)).toEqual(["Provider", "Company"]);
  });

  it("recognizes every _link span class", () => {
    const template =
      '<span class="coverpage_link">A</span> ' +
      '<span class="orderform_link">B</span> ' +
      '<span class="keyterms_link">C</span> ' +
      '<span class="sow_link">D</span> ' +
      '<span class="businessterms_link">E</span>';

    expect(extractFieldNames(template)).toEqual(["A", "B", "C", "D", "E"]);
  });
});

describe("slugifyFieldName", () => {
  it("produces camelCase keys", () => {
    expect(slugifyFieldName("Effective Date")).toBe("effectiveDate");
    expect(slugifyFieldName("SOW Term")).toBe("sowTerm");
    expect(slugifyFieldName("BAA Effective Date")).toBe("baaEffectiveDate");
  });
});
