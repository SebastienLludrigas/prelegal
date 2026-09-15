import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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

describe("NdaCreator", () => {
  it("reflects the governing law in the cover page as the user types it", async () => {
    renderCreator();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Governing law"), "Nevada");

    expect(await screen.findByText("Nevada")).toBeInTheDocument();
  });

  it("fills the live document as the user types the purpose", async () => {
    renderCreator();
    const user = userEvent.setup();

    const purposeField = screen.getByLabelText("Purpose");
    await user.clear(purposeField);
    await user.type(purposeField, "Evaluate a joint venture.");

    const matches = await screen.findAllByText(
      /Evaluate a joint venture\./
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it("switches the MNDA term wording when the open-ended option is chosen", async () => {
    renderCreator();
    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(
        /Continues until terminated in accordance with the terms of the MNDA\./
      )
    );

    const matches = await screen.findAllByText(
      "Continues until terminated in accordance with the terms of the MNDA."
    );
    expect(matches.length).toBeGreaterThan(0);
  });
});
