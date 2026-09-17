import type { NdaFormData, PartyDetails } from "@/lib/nda/types";
import type { NdaFieldsPatch, PartyDetailsPatch } from "./types";

function mergeParty(
  current: PartyDetails,
  patch: PartyDetailsPatch | null | undefined
): PartyDetails {
  if (!patch) return current;
  return {
    company: patch.company ?? current.company,
    signatoryName: patch.signatoryName ?? current.signatoryName,
    title: patch.title ?? current.title,
    noticeAddress: patch.noticeAddress ?? current.noticeAddress,
  };
}

/** Applies the fields the AI just extracted on top of the document already built, field-by-field. */
export function mergeNdaFields(
  current: NdaFormData,
  patch: NdaFieldsPatch
): NdaFormData {
  return {
    ...current,
    partyOne: mergeParty(current.partyOne, patch.partyOne),
    partyTwo: mergeParty(current.partyTwo, patch.partyTwo),
    purpose: patch.purpose ?? current.purpose,
    effectiveDate: patch.effectiveDate ?? current.effectiveDate,
    mndaTerm: patch.mndaTerm ?? current.mndaTerm,
    mndaTermYears: patch.mndaTermYears ?? current.mndaTermYears,
    confidentialityTerm:
      patch.confidentialityTerm ?? current.confidentialityTerm,
    confidentialityTermYears:
      patch.confidentialityTermYears ?? current.confidentialityTermYears,
    governingLaw: patch.governingLaw ?? current.governingLaw,
    jurisdiction: patch.jurisdiction ?? current.jurisdiction,
    modifications: patch.modifications ?? current.modifications,
  };
}
