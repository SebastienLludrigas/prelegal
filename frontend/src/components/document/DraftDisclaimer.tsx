/** Shown at the end of every generated document, on screen and in print. */
export function DraftDisclaimer() {
  return (
    <p className="mt-10 border-t border-paper-line pt-4 text-[11px] text-ink-faint">
      This document is a draft generated for convenience. It has not been
      reviewed by a lawyer and should not be relied on as legal advice —
      have it reviewed by qualified counsel before signing.
    </p>
  );
}
