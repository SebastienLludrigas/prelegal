# Mutual NDA Creator

A prototype web app for creating a Common Paper Mutual NDA (PL-4). Fill in a
form and watch the actual legal document — the Standard Terms from
[`templates/Mutual-NDA.md`](../templates/Mutual-NDA.md) and a rebuilt Cover
Page — fill in live, then download it as a PDF.

Everything runs client-side: no backend, no database, no accounts. The
Standard Terms are read from the repository's `templates/` directory at build
time and filled in by substituting the document's own `coverpage_link`
placeholders, so the binding legal text always matches the source template.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Downloading a PDF uses
the browser's native print-to-PDF (the "Download PDF" button calls
`window.print()` with a dedicated print stylesheet).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — run the test suite once (Vitest + React Testing Library)
- `npm run test:watch` — run tests in watch mode

## Structure

- `src/lib/nda/templateSource.ts` — reads the Standard Terms and Cover Page
  markdown from `../templates` at build time (server-only).
- `src/lib/nda/fillTemplate.ts` — pure functions that fill in the Standard
  Terms and extract the Cover Page's static prose.
- `src/components/document/` — the live document preview (Cover Page +
  Standard Terms), styled as a printable page.
- `src/components/form/` — the intake form, sectioned to match the Cover
  Page's own fields.
