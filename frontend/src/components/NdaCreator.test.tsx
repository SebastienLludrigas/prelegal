import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NdaCreator } from "./NdaCreator";

const standardTermsSource = `# Standard Terms

1. **Introduction**. Confidential information is used for the <span class="coverpage_link">Purpose</span>.
`;

function renderCreator() {
  return render(
    <NdaCreator
      standardTermsSource={standardTermsSource}
      coverPageIntro="This Mutual Non-Disclosure Agreement consists of a Cover Page and Standard Terms."
      coverPageFooter="Common Paper Mutual Non-Disclosure Agreement (Version 1.0)."
    />
  );
}

function mockChatReply(fields: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({ reply: "Got it, thanks!", fields }),
        { status: 200 }
      )
    )
  );
}

describe("NdaCreator", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fills the live document with the purpose extracted from the chat", async () => {
    mockChatReply({ purpose: "Evaluate a joint venture." });
    renderCreator();
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText("Message"),
      "We want to evaluate a joint venture"
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    const matches = await screen.findAllByText(/Evaluate a joint venture\./);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("reflects the governing law extracted from the chat in the cover page", async () => {
    mockChatReply({ governingLaw: "Nevada" });
    renderCreator();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "Governing law is Nevada");
    await user.click(screen.getByRole("button", { name: "Send" }));

    const matches = await screen.findAllByText("Nevada");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("switches the MNDA term wording when the AI extracts the open-ended option", async () => {
    mockChatReply({ mndaTerm: "continues" });
    renderCreator();
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText("Message"),
      "The MNDA should continue until terminated"
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    const matches = await screen.findAllByText(
      "Continues until terminated in accordance with the terms of the MNDA."
    );
    expect(matches.length).toBeGreaterThan(0);
  });
});
