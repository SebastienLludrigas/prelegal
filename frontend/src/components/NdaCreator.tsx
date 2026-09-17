"use client";

import { useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { NdaDocument, NdaPrintDocument } from "@/components/document/NdaDocument";
import { NdaForm } from "@/components/form/NdaForm";
import { defaultNdaFormData, type NdaFormData } from "@/lib/nda/types";

export function NdaCreator({
  standardTermsSource,
  coverPageIntro,
  coverPageFooter,
}: {
  standardTermsSource: string;
  coverPageIntro: string;
  coverPageFooter: string;
}) {
  const [form, setForm] = useState<NdaFormData>(defaultNdaFormData);
  const [mobileView, setMobileView] = useState<"form" | "document">("form");

  const documentProps = {
    form,
    standardTermsSource,
    coverPageIntro,
    coverPageFooter,
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col print:hidden lg:flex-row">
        <div className="flex flex-col border-b border-panel-line bg-panel lg:w-[420px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <header className="border-b border-panel-line px-6 py-5">
            <p className="text-[13px] font-medium text-ink-soft">
              Mutual NDA Creator
            </p>
            <h1 className="mt-1 font-serif text-[20px] text-ink">
              Fill in your NDA
            </h1>
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
            className={`min-h-0 flex-1 overflow-y-auto px-6 py-6 ${
              mobileView === "document" ? "hidden lg:block" : ""
            }`}
          >
            <NdaForm value={form} onChange={setForm} />
          </div>

          <div className="border-t border-panel-line px-6 py-4">
            <DownloadButton />
          </div>
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto bg-panel px-4 py-10 sm:px-8 ${
            mobileView === "form" ? "hidden lg:block" : ""
          }`}
        >
          <NdaDocument {...documentProps} />
        </div>
      </div>

      <NdaPrintDocument {...documentProps} />
    </>
  );
}
