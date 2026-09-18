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

/** The raw shape returned by POST /api/chat, before the document type is known to the caller. */
export type ChatApiResponse = {
  reply: string;
  documentType?: string | null;
  fields?: Record<string, unknown>;
};
