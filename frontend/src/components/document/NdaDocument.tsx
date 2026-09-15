import type { NdaFormData } from "@/lib/nda/types";
import { deriveStandardTermsValues, fillStandardTerms } from "@/lib/nda/fillTemplate";
import { CoverPage } from "./CoverPage";
import { StandardTerms } from "./StandardTerms";

export function NdaDocument({
  form,
  standardTermsSource,
  coverPageIntro,
  coverPageFooter,
}: {
  form: NdaFormData;
  standardTermsSource: string;
  coverPageIntro: string;
  coverPageFooter: string;
}) {
  const filledStandardTerms = fillStandardTerms(
    standardTermsSource,
    deriveStandardTermsValues(form)
  );

  return (
    <div
      id="mnda-print-area"
      className="mx-auto w-full max-w-[680px] rounded-[2px] border border-paper-line bg-paper px-10 py-12 shadow-[0_1px_2px_rgba(27,36,48,0.06),0_12px_28px_-8px_rgba(27,36,48,0.16)] sm:px-14"
    >
      <CoverPage form={form} intro={coverPageIntro} footer={coverPageFooter} />
      <hr className="my-10 border-t border-paper-line" />
      <StandardTerms filledMarkdown={filledStandardTerms} />
    </div>
  );
}
