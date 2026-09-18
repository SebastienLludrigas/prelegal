import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentHistory } from "./DocumentHistory";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("DocumentHistory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an empty state when the user has no documents", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([])));

    render(<DocumentHistory documentNames={{}} onContinue={vi.fn()} />);

    expect(
      await screen.findByText("You haven't started any documents yet.")
    ).toBeInTheDocument();
  });

  it("lists saved documents using their display name", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([
          {
            id: 1,
            documentType: "baa",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-02T00:00:00Z",
          },
        ])
      )
    );

    render(
      <DocumentHistory
        documentNames={{ baa: "Business Associate Agreement" }}
        onContinue={vi.fn()}
      />
    );

    expect(
      await screen.findByText("Business Associate Agreement")
    ).toBeInTheDocument();
  });

  it("fetches the full document and calls onContinue when Continue is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url === "/api/documents") {
          return Promise.resolve(
            jsonResponse([
              {
                id: 1,
                documentType: "baa",
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-02T00:00:00Z",
              },
            ])
          );
        }
        return Promise.resolve(
          jsonResponse({
            id: 1,
            documentType: "baa",
            fields: { provider: "Acme Health" },
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-02T00:00:00Z",
          })
        );
      })
    );
    const onContinue = vi.fn();

    render(
      <DocumentHistory
        documentNames={{ baa: "Business Associate Agreement" }}
        onContinue={onContinue}
      />
    );
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Continue" }));

    expect(fetch).toHaveBeenCalledWith("/api/documents/1");
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({ fields: { provider: "Acme Health" } })
    );
  });
});
