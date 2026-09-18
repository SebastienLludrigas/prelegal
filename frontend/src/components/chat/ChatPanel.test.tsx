import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatPanel } from "./ChatPanel";

const GREETING = "What legal document would you like to create today?";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

function renderPanel() {
  const onDocumentTypeResolved = vi.fn();
  const onFieldsExtracted = vi.fn();
  render(
    <ChatPanel
      onDocumentTypeResolved={onDocumentTypeResolved}
      onFieldsExtracted={onFieldsExtracted}
    />
  );
  return { onDocumentTypeResolved, onFieldsExtracted };
}

describe("ChatPanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an initial greeting asking which document to create", () => {
    renderPanel();
    expect(screen.getByText(GREETING)).toBeInTheDocument();
  });

  it("sends the message history and the (still unresolved) document type", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ reply: "Sure, what do you need?" }))
    );
    renderPanel();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "I need an NDA");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Sure, what do you need?")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          messages: [
            { role: "assistant", content: GREETING },
            { role: "user", content: "I need an NDA" },
          ],
          documentType: null,
        }),
      })
    );
  });

  it("continues the conversation automatically once a document type resolves", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ reply: "Let's set up your BAA.", documentType: "baa" })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          reply: "What's the provider's name?",
          fields: { provider: "Acme Health" },
        })
      );
    vi.stubGlobal("fetch", fetchMock);
    const { onDocumentTypeResolved, onFieldsExtracted } = renderPanel();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "I need a BAA");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Let's set up your BAA.")).toBeInTheDocument();
    expect(await screen.findByText("What's the provider's name?")).toBeInTheDocument();
    expect(onDocumentTypeResolved).toHaveBeenCalledWith("baa");
    expect(onFieldsExtracted).toHaveBeenCalledWith("baa", {
      provider: "Acme Health",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondCallBody.documentType).toBe("baa");
  });

  it("shows an error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));
    renderPanel();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
  });

  it("returns focus to the message input after the assistant replies", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ reply: "ok" })));
    renderPanel();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Message");

    await user.type(input, "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("ok");

    expect(input).toHaveFocus();
  });

  it("returns focus to the message input even when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));
    renderPanel();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Message");

    await user.type(input, "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("Something went wrong. Please try again.");

    expect(input).toHaveFocus();
  });
});
