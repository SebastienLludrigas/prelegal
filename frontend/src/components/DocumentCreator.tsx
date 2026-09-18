"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { DownloadButton } from "@/components/DownloadButton";
import { GenericDocument, GenericPrintDocument } from "@/components/document/GenericDocument";
import { NdaDocument, NdaPrintDocument } from "@/components/document/NdaDocument";
import type { NdaFieldsPatch } from "@/lib/chat/types";
import { mergeNdaFields } from "@/lib/chat/mergeNdaFields";
import type { GenericDocumentSource } from "@/lib/documents/catalogSource";
import type { GenericFormData } from "@/lib/documents/fillGenericTemplate";
import type { GenericFieldsPatch } from "@/lib/documents/mergeGenericFields";
import { mergeGenericFields } from "@/lib/documents/mergeGenericFields";
import { defaultNdaFormData, type NdaFormData } from "@/lib/nda/types";

const NDA_DOCUMENT_ID = "mutual-nda";

export function DocumentCreator({
  ndaStandardTermsSource,
  ndaCoverPageIntro,
  ndaCoverPageFooter,
  genericDocuments,
}: {
  ndaStandardTermsSource: string;
  ndaCoverPageIntro: string;
  ndaCoverPageFooter: string;
  genericDocuments: Record<string, GenericDocumentSource>;
}) {
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [ndaForm, setNdaForm] = useState<NdaFormData>(defaultNdaFormData);
  const [genericFields, setGenericFields] = useState<GenericFormData>({});
  const [mobileView, setMobileView] = useState<"form" | "document">("form");

  function handleFieldsExtracted(resolvedType: string, fields: Record<string, unknown>) {
    if (resolvedType === NDA_DOCUMENT_ID) {
      setNdaForm((current) => mergeNdaFields(current, fields as NdaFieldsPatch));
    } else {
      setGenericFields((current) =>
        mergeGenericFields(current, fields as GenericFieldsPatch)
      );
    }
  }

  const genericDocument = documentType ? genericDocuments[documentType] : undefined;

  const eyebrow =
    documentType === NDA_DOCUMENT_ID
      ? "Mutual NDA Creator"
      : (genericDocument?.name ?? "Legal Document Creator");
  const heading =
    documentType === NDA_DOCUMENT_ID
      ? "Fill in your NDA"
      : genericDocument
        ? "Fill in your document"
        : "What do you need today?";

  function renderPreview(forPrint: boolean) {
    if (documentType === NDA_DOCUMENT_ID) {
      const props = {
        form: ndaForm,
        standardTermsSource: ndaStandardTermsSource,
        coverPageIntro: ndaCoverPageIntro,
        coverPageFooter: ndaCoverPageFooter,
      };
      return forPrint ? <NdaPrintDocument {...props} /> : <NdaDocument {...props} />;
    }
    if (genericDocument) {
      const props = {
        name: genericDocument.name,
        standardTermsSource: genericDocument.standardTermsSource,
        fields: genericFields,
      };
      return forPrint ? (
        <GenericPrintDocument {...props} />
      ) : (
        <GenericDocument {...props} />
      );
    }
    return forPrint ? null : (
      <div className="flex min-h-full items-center justify-center">
        <p className="mx-auto max-w-[420px] text-center text-[14px] text-ink-soft">
          Tell the assistant which document you&apos;d like to create — your
          document will appear here once we know what to draft.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col print:hidden lg:flex-row">
        <div className="flex flex-col border-b border-panel-line bg-panel lg:w-[420px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <header className="border-b border-panel-line px-6 py-5">
            <p className="text-[13px] font-medium text-ink-soft">{eyebrow}</p>
            <h1 className="mt-1 font-serif text-[20px] text-ink">{heading}</h1>
          </header>

          <div
            className="flex border-b border-panel-line lg:hidden"
            role="tablist"
          >
            {(["form", "document"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={mobileView === tab}
                onClick={() => setMobileView(tab)}
                className={`flex-1 px-4 py-2.5 text-[13.5px] font-medium ${
                  mobileView === tab
                    ? "border-b-2 border-accent text-ink"
                    : "text-ink-soft"
                }`}
              >
                {tab === "form" ? "Form" : "Document"}
              </button>
            ))}
          </div>

          <div
            className={`flex min-h-0 flex-1 flex-col px-6 py-6 ${
              mobileView === "document" ? "hidden lg:flex" : ""
            }`}
          >
            <ChatPanel
              onDocumentTypeResolved={setDocumentType}
              onFieldsExtracted={handleFieldsExtracted}
            />
          </div>

          <div className="border-t border-panel-line px-6 py-4">
            <DownloadButton />
          </div>
        </div>

        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto bg-panel px-4 py-10 sm:px-8 ${
            mobileView === "form" ? "hidden lg:block" : ""
          }`}
        >
          {renderPreview(false)}
        </div>
      </div>

      {renderPreview(true)}
    </>
  );
}
