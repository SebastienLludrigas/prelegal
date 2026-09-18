"use client";

import { useEffect, useState } from "react";
import type { SavedDocument, SavedDocumentSummary } from "@/lib/documents/savedDocument";

export function DocumentHistory({
  documentNames,
  onContinue,
}: {
  documentNames: Record<string, string>;
  onContinue: (document: SavedDocument) => void;
}) {
  const [documents, setDocuments] = useState<SavedDocumentSummary[] | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/documents")
      .then((response) => (response.ok ? response.json() : []))
      .then(setDocuments);
  }, []);

  async function handleContinue(id: number) {
    setOpeningId(id);
    const response = await fetch(`/api/documents/${id}`);
    if (response.ok) {
      onContinue(await response.json());
    }
    setOpeningId(null);
  }

  if (documents === null) {
    return <p className="px-6 py-10 text-[14px] text-ink-soft">Loading your documents…</p>;
  }

  if (documents.length === 0) {
    return (
      <p className="px-6 py-10 text-[14px] text-ink-soft">
        You haven&apos;t started any documents yet.
      </p>
    );
  }

  return (
    <ul className="mx-auto w-full max-w-[680px] divide-y divide-panel-line px-4 py-10 sm:px-8">
      {documents.map((document) => (
        <li
          key={document.id}
          className="flex items-center justify-between gap-4 py-4"
        >
          <div>
            <p className="text-[14px] font-medium text-ink">
              {documentNames[document.documentType] ?? document.documentType}
            </p>
            <p className="text-[12.5px] text-ink-soft">
              Last edited {new Date(document.updatedAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleContinue(document.id)}
            disabled={openingId === document.id}
            className="rounded-[3px] bg-blue px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-60"
          >
            Continue
          </button>
        </li>
      ))}
    </ul>
  );
}
