import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentCreator } from "./DocumentCreator";

const ndaStandardTermsSource = `# Standard Terms

1. **Introduction**. Confidential information is used for the <span class="coverpage_link">Purpose</span>.
`;

const genericDocuments = {
  baa: {
    name: "Business Associate Agreement",
    standardTermsSource: `# BAA

<span class="keyterms_link">Provider</span> will comply with this BAA.
`,
  },
};

function renderCreator(initialDocument?: Parameters<typeof DocumentCreator>[0]["initialDocument"]) {
  return render(
    <DocumentCreator
      ndaStandardTermsSource={ndaStandardTermsSource}
      ndaCoverPageIntro="This Mutual Non-Disclosure Agreement consists of a Cover Page and Standard Terms."
      ndaCoverPageFooter="Common Paper Mutual Non-Disclosure Agreement (Version 1.0)."
      genericDocuments={genericDocuments}
      initialDocument={initialDocument}
    />
  );
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

async function sendMessage(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Message"), text);
  await user.click(screen.getByRole("button", { name: "Send" }));
}

describe("DocumentCreator", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fills the live NDA document once the chat resolves to the Mutual NDA", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({ reply: "Let's set up your NDA.", documentType: "mutual-nda" })
        )
        .mockResolvedValueOnce(
          jsonResponse({
            reply: "What's the purpose?",
            fields: { purpose: "Evaluate a joint venture." },
          })
        )
        .mockResolvedValueOnce(
          jsonResponse({ id: 1, documentType: "mutual-nda", fields: {} })
        )
    );
    renderCreator();

    await sendMessage("I need an NDA");

    const matches = await screen.findAllByText(/Evaluate a joint venture\./);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("autosaves the document after fields are extracted", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({ reply: "Let's set up your BAA.", documentType: "baa" })
        )
        .mockResolvedValueOnce(
          jsonResponse({
            reply: "What's the provider's name?",
            fields: { provider: "Acme Health" },
          })
        )
        .mockResolvedValueOnce(jsonResponse({ id: 42, documentType: "baa", fields: {} }))
    );
    renderCreator();

    await sendMessage("I need a BAA");
    await screen.findAllByText("Acme Health");

    expect(fetch).toHaveBeenLastCalledWith(
      "/api/documents",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          id: null,
          documentType: "baa",
          fields: { provider: "Acme Health" },
        }),
      })
    );
  });

  it("fills a generic document once the chat resolves to a non-NDA type", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({ reply: "Let's set up your BAA.", documentType: "baa" })
        )
        .mockResolvedValueOnce(
          jsonResponse({
            reply: "What's the provider's name?",
            fields: { provider: "Acme Health" },
          })
        )
        .mockResolvedValueOnce(jsonResponse({ id: 1, documentType: "baa", fields: {} }))
    );
    renderCreator();

    await sendMessage("I need a BAA");

    expect(
      (await screen.findAllByText("Business Associate Agreement")).length
    ).toBeGreaterThan(0);
    const matches = await screen.findAllByText("Acme Health");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows a placeholder before any document type is resolved", () => {
    renderCreator();
    expect(
      screen.getByText(/your document will appear here/i)
    ).toBeInTheDocument();
  });

  it("preloads a saved document passed as initialDocument", () => {
    renderCreator({
      id: 7,
      documentType: "baa",
      fields: { provider: "Acme Health" },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    expect(screen.getAllByText("Acme Health").length).toBeGreaterThan(0);
  });
});
