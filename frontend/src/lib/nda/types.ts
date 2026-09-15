export type MndaTermOption = "expires" | "continues";
export type ConfidentialityTermOption = "fixed" | "perpetual";

export type PartyDetails = {
  company: string;
  signatoryName: string;
  title: string;
  noticeAddress: string;
};

export type NdaFormData = {
  partyOne: PartyDetails;
  partyTwo: PartyDetails;
  purpose: string;
  effectiveDate: string;
  mndaTerm: MndaTermOption;
  mndaTermYears: string;
  confidentialityTerm: ConfidentialityTermOption;
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
};

export const emptyParty: PartyDetails = {
  company: "",
  signatoryName: "",
  title: "",
  noticeAddress: "",
};

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const defaultNdaFormData: NdaFormData = {
  partyOne: { ...emptyParty },
  partyTwo: { ...emptyParty },
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: todayIso(),
  mndaTerm: "expires",
  mndaTermYears: "1",
  confidentialityTerm: "fixed",
  confidentialityTermYears: "1",
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
};
