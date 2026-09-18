import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppGate } from "./AppGate";

const ndaStandardTermsSource = `# Standard Terms

1. **Introduction**. Confidential information is used for the <span class="coverpage_link">Purpose</span>.
`;

function renderGate() {
  return render(
    <AppGate
      ndaStandardTermsSource={ndaStandardTermsSource}
      ndaCoverPageIntro="Intro."
      ndaCoverPageFooter="Footer."
      genericDocuments={{}}
    />
  );
}

function stubFetch(meResponse: Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url === "/api/auth/me") return meResponse;
      return new Response(JSON.stringify({ id: 1, email: "a@example.com" }), {
        status: 200,
      });
    })
  );
}

describe("AppGate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the login screen when there is no session", async () => {
    stubFetch(new Response(null, { status: 401 }));

    renderGate();

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByText(/What do you need today/)).not.toBeInTheDocument();
  });

  it("restores the session and skips the login screen when /me succeeds", async () => {
    stubFetch(
      new Response(JSON.stringify({ id: 1, email: "a@example.com" }), {
        status: 200,
      })
    );

    renderGate();

    expect(await screen.findByText("a@example.com")).toBeInTheDocument();
  });

  it("reveals the app once sign in succeeds", async () => {
    stubFetch(new Response(null, { status: 401 }));

    renderGate();
    const user = userEvent.setup();

    await screen.findByRole("heading", { name: "Sign in" });
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/What do you need today/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/signin",
      expect.objectContaining({ method: "POST" })
    );
  });
});
