import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatPanel } from "./ChatPanel";

const GREETING =
  "Let's set up your Mutual NDA. To start, what's the name of your company (Party One)?";

describe("ChatPanel", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            reply: "Got it, what's Party One's company name?",
            fields: { purpose: "Evaluate a joint venture." },
          }),
          { status: 200 }
        )
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an initial greeting from the assistant", () => {
    render(<ChatPanel onFieldsExtracted={vi.fn()} />);

    expect(
      screen.getByText(/let's set up your mutual nda/i)
    ).toBeInTheDocument();
  });

  it("sends the message history to /api/chat and shows the assistant's reply", async () => {
    render(<ChatPanel onFieldsExtracted={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText("Message"),
      "We want to explore a partnership"
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Got it, what's Party One's company name?")
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          messages: [
            { role: "assistant", content: GREETING },
            { role: "user", content: "We want to explore a partnership" },
          ],
        }),
      })
    );
  });

  it("merges the fields extracted by the assistant into the document", async () => {
    const onFieldsExtracted = vi.fn();
    render(<ChatPanel onFieldsExtracted={onFieldsExtracted} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await screen.findByText("Got it, what's Party One's company name?");
    expect(onFieldsExtracted).toHaveBeenCalledWith({
      purpose: "Evaluate a joint venture.",
    });
  });

  it("shows an error and keeps the user's message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 }))
    );
    render(<ChatPanel onFieldsExtracted={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
  });
});
