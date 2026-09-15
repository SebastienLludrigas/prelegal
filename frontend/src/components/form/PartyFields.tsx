import type { PartyDetails } from "@/lib/nda/types";
import { Field, TextInput } from "./FormPrimitives";

export function PartyFields({
  idPrefix,
  label,
  value,
  onChange,
}: {
  idPrefix: string;
  label: string;
  value: PartyDetails;
  onChange: (value: PartyDetails) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[3px] border border-panel-line bg-white/60 p-3">
      <p className="text-[12.5px] font-medium text-ink-soft">{label}</p>
      <Field label="Company" htmlFor={`${idPrefix}-company`}>
        <TextInput
          id={`${idPrefix}-company`}
          value={value.company}
          onChange={(v) => onChange({ ...value, company: v })}
          placeholder="Acme, Inc."
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Signatory name" htmlFor={`${idPrefix}-name`}>
          <TextInput
            id={`${idPrefix}-name`}
            value={value.signatoryName}
            onChange={(v) => onChange({ ...value, signatoryName: v })}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Title" htmlFor={`${idPrefix}-title`}>
          <TextInput
            id={`${idPrefix}-title`}
            value={value.title}
            onChange={(v) => onChange({ ...value, title: v })}
            placeholder="CEO"
          />
        </Field>
      </div>
      <Field
        label="Notice address"
        htmlFor={`${idPrefix}-address`}
        hint="Email or postal address"
      >
        <TextInput
          id={`${idPrefix}-address`}
          value={value.noticeAddress}
          onChange={(v) => onChange({ ...value, noticeAddress: v })}
          placeholder="jane@acme.com"
        />
      </Field>
    </div>
  );
}
