import { describe, expect, it } from "vitest";
import { defaultNdaFormData } from "@/lib/nda/types";
import { mergeNdaFields } from "./mergeNdaFields";

describe("mergeNdaFields", () => {
  it("overwrites only the top-level fields present in the patch", () => {
    const merged = mergeNdaFields(defaultNdaFormData, {
      purpose: "Evaluate a joint venture.",
    });

    expect(merged.purpose).toBe("Evaluate a joint venture.");
    expect(merged.governingLaw).toBe(defaultNdaFormData.governingLaw);
  });

  it("ignores null fields in the patch, keeping the current value", () => {
    const current = { ...defaultNdaFormData, governingLaw: "Delaware" };

    const merged = mergeNdaFields(current, { governingLaw: null });

    expect(merged.governingLaw).toBe("Delaware");
  });

  it("merges partyOne field-by-field without dropping fields the patch omits", () => {
    const current = {
      ...defaultNdaFormData,
      partyOne: {
        company: "Acme Inc.",
        signatoryName: "",
        title: "",
        noticeAddress: "",
      },
    };

    const merged = mergeNdaFields(current, {
      partyOne: { signatoryName: "Jane Doe" },
    });

    expect(merged.partyOne).toEqual({
      company: "Acme Inc.",
      signatoryName: "Jane Doe",
      title: "",
      noticeAddress: "",
    });
  });

  it("leaves partyTwo untouched when the patch does not mention it", () => {
    const current = {
      ...defaultNdaFormData,
      partyTwo: {
        company: "Beta LLC",
        signatoryName: "",
        title: "",
        noticeAddress: "",
      },
    };

    const merged = mergeNdaFields(current, { purpose: "x" });

    expect(merged.partyTwo).toEqual(current.partyTwo);
  });
});
