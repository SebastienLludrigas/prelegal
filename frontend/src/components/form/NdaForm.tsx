"use client";

import type { NdaFormData } from "@/lib/nda/types";
import {
  ChoiceRow,
  Field,
  Section,
  TextAreaInput,
  TextInput,
} from "./FormPrimitives";
import { PartyFields } from "./PartyFields";

export function NdaForm({
  value,
  onChange,
}: {
  value: NdaFormData;
  onChange: (value: NdaFormData) => void;
}) {
  function set<K extends keyof NdaFormData>(key: K, next: NdaFormData[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Parties"
        description="Who is disclosing and receiving confidential information."
      >
        <PartyFields
          idPrefix="party-one"
          label="Party 1 (you)"
          value={value.partyOne}
          onChange={(v) => set("partyOne", v)}
        />
        <PartyFields
          idPrefix="party-two"
          label="Party 2 (counterparty)"
          value={value.partyTwo}
          onChange={(v) => set("partyTwo", v)}
        />
      </Section>

      <Section
        title="Purpose"
        description="How the confidential information may be used."
      >
        <Field label="Purpose" htmlFor="purpose">
          <TextAreaInput
            id="purpose"
            value={value.purpose}
            onChange={(v) => set("purpose", v)}
            rows={3}
          />
        </Field>
      </Section>

      <Section title="Effective date">
        <Field label="Effective date" htmlFor="effective-date">
          <TextInput
            id="effective-date"
            type="date"
            value={value.effectiveDate}
            onChange={(v) => set("effectiveDate", v)}
          />
        </Field>
      </Section>

      <Section title="MNDA term" description="How long this MNDA lasts.">
        <ChoiceRow
          id="mnda-term-expires"
          name="mnda-term"
          checked={value.mndaTerm === "expires"}
          onSelect={() => set("mndaTerm", "expires")}
        >
          Expires{" "}
          <input
            aria-label="MNDA term, years"
            type="number"
            min="1"
            disabled={value.mndaTerm !== "expires"}
            value={value.mndaTermYears}
            onChange={(e) => set("mndaTermYears", e.target.value)}
            className="mx-1 w-14 rounded-[3px] border border-panel-line bg-white px-1.5 py-0.5 text-[13.5px] disabled:opacity-50"
          />{" "}
          year(s) from Effective Date.
        </ChoiceRow>
        <ChoiceRow
          id="mnda-term-continues"
          name="mnda-term"
          checked={value.mndaTerm === "continues"}
          onSelect={() => set("mndaTerm", "continues")}
        >
          Continues until terminated in accordance with the terms of the
          MNDA.
        </ChoiceRow>
      </Section>

      <Section
        title="Term of confidentiality"
        description="How long confidential information stays protected."
      >
        <ChoiceRow
          id="confidentiality-fixed"
          name="confidentiality-term"
          checked={value.confidentialityTerm === "fixed"}
          onSelect={() => set("confidentialityTerm", "fixed")}
        >
          <input
            aria-label="Term of confidentiality, years"
            type="number"
            min="1"
            disabled={value.confidentialityTerm !== "fixed"}
            value={value.confidentialityTermYears}
            onChange={(e) => set("confidentialityTermYears", e.target.value)}
            className="mx-1 w-14 rounded-[3px] border border-panel-line bg-white px-1.5 py-0.5 text-[13.5px] disabled:opacity-50"
          />{" "}
          year(s) from Effective Date, but in the case of trade secrets until
          no longer considered a trade secret under applicable law.
        </ChoiceRow>
        <ChoiceRow
          id="confidentiality-perpetual"
          name="confidentiality-term"
          checked={value.confidentialityTerm === "perpetual"}
          onSelect={() => set("confidentialityTerm", "perpetual")}
        >
          In perpetuity.
        </ChoiceRow>
      </Section>

      <Section title="Governing law &amp; jurisdiction">
        <Field label="Governing law" htmlFor="governing-law" hint="State">
          <TextInput
            id="governing-law"
            value={value.governingLaw}
            onChange={(v) => set("governingLaw", v)}
            placeholder="Delaware"
          />
        </Field>
        <Field
          label="Jurisdiction"
          htmlFor="jurisdiction"
          hint="City or county and state"
        >
          <TextInput
            id="jurisdiction"
            value={value.jurisdiction}
            onChange={(v) => set("jurisdiction", v)}
            placeholder="New Castle, DE"
          />
        </Field>
      </Section>

      <Section
        title="Modifications"
        description="Optional. Any changes to the Standard Terms."
      >
        <Field label="Modifications" htmlFor="modifications">
          <TextAreaInput
            id="modifications"
            value={value.modifications}
            onChange={(v) => set("modifications", v)}
            rows={2}
            placeholder="None"
          />
        </Field>
      </Section>
    </div>
  );
}
