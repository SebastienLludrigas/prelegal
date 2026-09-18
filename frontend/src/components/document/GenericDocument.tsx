import type { GenericFormData } from "@/lib/documents/fillGenericTemplate";
import { fillGenericTemplate } from "@/lib/documents/fillGenericTemplate";
import { DraftDisclaimer } from "./DraftDisclaimer";
import { StandardTerms } from "./StandardTerms";

function GenericDocumentContent({
  name,
  standardTermsSource,
  fields,
}: {
  name: string;
  standardTermsSource: string;
  fields: GenericFormData;
}) {
  return (
    <>
      <p className="text-[12.5px] font-medium text-ink-soft">{name}</p>
      <hr className="my-6 border-t border-paper-line" />
      <StandardTerms filledMarkdown={fillGenericTemplate(standardTermsSource, fields)} />
      <DraftDisclaimer />
    </>
  );
}

type GenericDocumentProps = {
  name: string;
  standardTermsSource: string;
  fields: GenericFormData;
};

/** The on-screen "paper" preview for any document that isn't the Mutual NDA. */
export function GenericDocument(props: GenericDocumentProps) {
  return (
    <div className="mx-auto w-full max-w-[680px] rounded-[2px] border border-paper-line bg-paper px-10 py-12 shadow-[0_1px_2px_rgba(27,36,48,0.06),0_12px_28px_-8px_rgba(27,36,48,0.16)] sm:px-14">
      <GenericDocumentContent {...props} />
    </div>
  );
}

/** A separate copy shown only for print, matching NdaPrintDocument's approach. */
export function GenericPrintDocument(props: GenericDocumentProps) {
  return (
    <div className="hidden print:block">
      <GenericDocumentContent {...props} />
    </div>
  );
}
