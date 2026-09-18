import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import type { GenericDocumentSource } from "@/lib/documents/catalogSource";

const ndaStandardTermsSource = `# Standard Terms

1. **Introduction**. Confidential information is used for the <span class="coverpage_link">Purpose</span>.
`;

function renderShell(
  onLogout = vi.fn(),
  genericDocuments: Record<string, GenericDocumentSource> = {}
) {
  return render(
    <AppShell
      user={{ id: 1, email: "a@example.com" }}
      onLogout={onLogout}
      ndaStandardTermsSource={ndaStandardTermsSource}
      ndaCoverPageIntro="Intro."
      ndaCoverPageFooter="Footer."
      genericDocuments={genericDocuments}
    />
  );
}

describe("AppShell", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the document creator by default", () => {
    renderShell();
    expect(screen.getByText(/What do you need today\?/)).toBeInTheDocument();
  });

  it("switches to My documents and back to New document", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })));
    renderShell();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "My documents" }));
    expect(
      await screen.findByText("You haven't started any documents yet.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New document" }));
    expect(screen.getByText(/What do you need today\?/)).toBeInTheDocument();
  });

  it("clears a reopened document when New document is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/documents") {
          return new Response(
            JSON.stringify([
              {
                id: 1,
                documentType: "baa",
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
              },
            ]),
            { status: 200 }
          );
        }
        return new Response(
          JSON.stringify({
            id: 1,
            documentType: "baa",
            fields: { provider: "Acme Health" },
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          }),
          { status: 200 }
        );
      })
    );
    renderShell(vi.fn(), {
      baa: {
        name: "Business Associate Agreement",
        standardTermsSource: `# BAA

<span class="keyterms_link">Provider</span> will comply with this BAA.
`,
      },
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "My documents" }));
    await user.click(await screen.findByRole("button", { name: "Continue" }));
    expect(await screen.findAllByText("Acme Health")).not.toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "New document" }));

    expect(screen.getByText(/What do you need today\?/)).toBeInTheDocument();
    expect(screen.queryByText("Acme Health")).not.toBeInTheDocument();
  });

  it("shows the user's email and calls onLogout when Log out is clicked", async () => {
    const onLogout = vi.fn();
    renderShell(onLogout);
    const user = userEvent.setup();

    expect(screen.getByText("a@example.com")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(onLogout).toHaveBeenCalled();
  });
});
