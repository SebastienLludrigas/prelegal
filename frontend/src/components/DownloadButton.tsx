"use client";

export function DownloadButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full rounded-[3px] bg-accent px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#5b2c70] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent"
    >
      Download PDF
    </button>
  );
}
