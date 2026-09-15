import type { NdaFormData, PartyDetails } from "@/lib/nda/types";
import { formatDate } from "@/lib/nda/fillTemplate";
import { Blank } from "./Blank";
import { InlineMarkdown } from "./InlineMarkdown";

function PartyColumn({ party }: { party: PartyDetails }) {
  return (
    <>
      <td className="border border-paper-line px-3 py-2 align-top">
        <Blank value={party.signatoryName} placeholder="Print name" />
      </td>
      <td className="border border-paper-line px-3 py-2 align-top">
        <Blank value={party.title} placeholder="Title" />
      </td>
      <td className="border border-paper-line px-3 py-2 align-top">
        <Blank value={party.company} placeholder="Company" />
      </td>
      <td className="border border-paper-line px-3 py-2 align-top">
        <Blank value={party.noticeAddress} placeholder="Notice address" />
      </td>
    </>
  );
}

export function CoverPage({
  form,
  intro,
  footer,
}: {
  form: NdaFormData;
  intro: string;
  footer: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-[26px] font-medium text-ink">
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="mt-3 text-[13px] font-medium text-ink-soft">
          Cover Page
        </p>
      </div>

      <InlineMarkdown className="text-[14.5px] leading-relaxed text-ink-soft">
        {intro}
      </InlineMarkdown>

      <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-[14.5px]">
        <dt className="text-ink-soft">Purpose</dt>
        <dd>
          <Blank
            value={form.purpose}
            placeholder="How confidential information may be used"
          />
        </dd>

        <dt className="text-ink-soft">Effective date</dt>
        <dd>
          <Blank
            value={formatDate(form.effectiveDate)}
            placeholder="Today's date"
          />
        </dd>

        <dt className="text-ink-soft">MNDA term</dt>
        <dd>
          {form.mndaTerm === "expires" ? (
            <>Expires {form.mndaTermYears || "0"} year(s) from Effective Date.</>
          ) : (
            <>Continues until terminated in accordance with the terms of the MNDA.</>
          )}
        </dd>

        <dt className="text-ink-soft">Term of confidentiality</dt>
        <dd>
          {form.confidentialityTerm === "fixed" ? (
            <>
              {form.confidentialityTermYears || "0"} year(s) from Effective
              Date, but in the case of trade secrets until no longer
              considered a trade secret under applicable law.
            </>
          ) : (
            <>In perpetuity.</>
          )}
        </dd>

        <dt className="text-ink-soft">Governing law</dt>
        <dd>
          <Blank value={form.governingLaw} placeholder="State" />
        </dd>

        <dt className="text-ink-soft">Jurisdiction</dt>
        <dd>
          <Blank
            value={form.jurisdiction}
            placeholder="City or county and state"
          />
        </dd>

        <dt className="text-ink-soft">MNDA modifications</dt>
        <dd>
          <Blank value={form.modifications} placeholder="None" />
        </dd>
      </dl>

      <p className="text-[14px] text-ink-soft">
        By signing this Cover Page, each party agrees to enter into this MNDA
        as of the Effective Date.
      </p>

      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr>
            <th className="border border-paper-line bg-paper px-3 py-2 text-left font-medium text-ink-soft">
              &nbsp;
            </th>
            <th className="border border-paper-line bg-paper px-3 py-2 text-left font-medium text-ink-soft">
              Print name
            </th>
            <th className="border border-paper-line bg-paper px-3 py-2 text-left font-medium text-ink-soft">
              Title
            </th>
            <th className="border border-paper-line bg-paper px-3 py-2 text-left font-medium text-ink-soft">
              Company
            </th>
            <th className="border border-paper-line bg-paper px-3 py-2 text-left font-medium text-ink-soft">
              Notice address
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-paper-line px-3 py-2 font-medium text-ink-soft">
              Party 1
            </td>
            <PartyColumn party={form.partyOne} />
          </tr>
          <tr>
            <td className="border border-paper-line px-3 py-2 font-medium text-ink-soft">
              Party 2
            </td>
            <PartyColumn party={form.partyTwo} />
          </tr>
        </tbody>
      </table>

      <InlineMarkdown className="text-[12.5px] text-ink-faint">
        {footer}
      </InlineMarkdown>
    </div>
  );
}
