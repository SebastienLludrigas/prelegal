import "server-only";
import fs from "node:fs";
import path from "node:path";

const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

function readTemplate(filename: string): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, filename), "utf-8");
}

/** Raw markdown of the Common Paper Mutual NDA Standard Terms, read at build time. */
export function readStandardTermsSource(): string {
  return readTemplate("Mutual-NDA.md");
}

/** Raw markdown of the Common Paper Mutual NDA Cover Page, read at build time. */
export function readCoverPageSource(): string {
  return readTemplate("Mutual-NDA-coverpage.md");
}
