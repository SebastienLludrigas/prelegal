"use client";

import { useState } from "react";
import { DocumentCreator } from "@/components/DocumentCreator";
import { DocumentHistory } from "@/components/DocumentHistory";
import type { SessionUser } from "@/lib/auth/types";
import type { GenericDocumentSource } from "@/lib/documents/catalogSource";
import type { SavedDocument } from "@/lib/documents/savedDocument";

const NDA_DOCUMENT_ID = "mutual-nda";
const NDA_DOCUMENT_NAME = "Mutual Non-Disclosure Agreement";

type View = "create" | "history";

export function AppShell({
  user,
  onLogout,
  ndaStandardTermsSource,
  ndaCoverPageIntro,
  ndaCoverPageFooter,
  genericDocuments,
}: {
  user: SessionUser;
  onLogout: () => void;
  ndaStandardTermsSource: string;
  ndaCoverPageIntro: string;
  ndaCoverPageFooter: string;
  genericDocuments: Record<string, GenericDocumentSource>;
}) {
  const [view, setView] = useState<View>("create");
  const [openedDocument, setOpenedDocument] = useState<SavedDocument | null>(null);
  const [resetCount, setResetCount] = useState(0);

  const documentNames: Record<string, string> = { [NDA_DOCUMENT_ID]: NDA_DOCUMENT_NAME };
  for (const [id, doc] of Object.entries(genericDocuments)) {
    documentNames[id] = doc.name;
  }

  function handleNewDocument() {
    setOpenedDocument(null);
    setResetCount((count) => count + 1);
    setView("create");
  }

  function handleContinue(document: SavedDocument) {
    setOpenedDocument(document);
    setView("create");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between bg-navy px-6 py-3 print:hidden">
        <p className="font-serif text-[16px] text-white">
          Prelegal<span className="text-yellow">.</span>
        </p>
        <nav className="flex items-center gap-5 text-[13px] text-white/85">
          <button
            type="button"
            onClick={handleNewDocument}
            aria-pressed={view === "create"}
            className={view === "create" ? "font-medium text-white" : ""}
          >
            New document
          </button>
          <button
            type="button"
            onClick={() => setView("history")}
            aria-pressed={view === "history"}
            className={view === "history" ? "font-medium text-white" : ""}
          >
            My documents
          </button>
          <span className="text-white/60">{user.email}</span>
          <button type="button" onClick={onLogout} className="hover:text-white">
            Log out
          </button>
        </nav>
      </header>

      {view === "create" ? (
        <DocumentCreator
          key={`${resetCount}-${openedDocument?.id ?? "new"}`}
          ndaStandardTermsSource={ndaStandardTermsSource}
          ndaCoverPageIntro={ndaCoverPageIntro}
          ndaCoverPageFooter={ndaCoverPageFooter}
          genericDocuments={genericDocuments}
          initialDocument={openedDocument}
        />
      ) : (
        <DocumentHistory documentNames={documentNames} onContinue={handleContinue} />
      )}
    </div>
  );
}
