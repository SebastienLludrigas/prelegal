import "server-only";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.join(process.cwd(), "..");
const CATALOG_PATH = path.join(REPO_ROOT, "catalog.json");
const TEMPLATES_DIR = path.join(REPO_ROOT, "templates");

const NDA_STANDARD_TERMS_FILENAME = "Mutual-NDA.md";
const NDA_COVERPAGE_FILENAME = "Mutual-NDA-coverpage.md";

type CatalogEntry = { name: string; description: string; filename: string };

export type GenericDocumentSource = {
  name: string;
  standardTermsSource: string;
};

function idFromFilename(filename: string): string {
  const stem = filename.replace(/\.md$/, "");
  return stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Raw markdown of every non-NDA document's Standard Terms, read at build time,
 * keyed by document id. The Mutual NDA is read separately by lib/nda/templateSource.ts,
 * since it keeps its own two-file (cover page + standard terms) shape.
 */
export function readGenericDocumentSources(): Record<string, GenericDocumentSource> {
  const catalog: CatalogEntry[] = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
  const sources: Record<string, GenericDocumentSource> = {};
  for (const entry of catalog) {
    if (
      entry.filename === NDA_STANDARD_TERMS_FILENAME ||
      entry.filename === NDA_COVERPAGE_FILENAME
    ) {
      continue;
    }
    sources[idFromFilename(entry.filename)] = {
      name: entry.name,
      standardTermsSource: fs.readFileSync(
        path.join(TEMPLATES_DIR, entry.filename),
        "utf-8"
      ),
    };
  }
  return sources;
}
