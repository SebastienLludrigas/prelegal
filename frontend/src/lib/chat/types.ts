import type {
  ConfidentialityTermOption,
  MndaTermOption,
  PartyDetails,
} from "@/lib/nda/types";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type PartyDetailsPatch = Partial<PartyDetails>;

/** The subset of `NdaFormData` the AI extracted from the conversation so far. */
export type NdaFieldsPatch = {
  partyOne?: PartyDetailsPatch | null;
  partyTwo?: PartyDetailsPatch | null;
  purpose?: string | null;
  effectiveDate?: string | null;
  mndaTerm?: MndaTermOption | null;
  mndaTermYears?: string | null;
  confidentialityTerm?: ConfidentialityTermOption | null;
  confidentialityTermYears?: string | null;
  governingLaw?: string | null;
  jurisdiction?: string | null;
  modifications?: string | null;
};

export type ChatTurnResult = {
  reply: string;
  fields: NdaFieldsPatch;
};
