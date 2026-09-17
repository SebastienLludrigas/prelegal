import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppGate } from "./AppGate";

describe("AppGate", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ status: "ok" }), { status: 200 }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the login screen before the children", () => {
    render(
      <AppGate>
        <p>Protected content</p>
      </AppGate>
    );

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("reveals the children once sign in succeeds", async () => {
    render(
      <AppGate>
        <p>Protected content</p>
      </AppGate>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/signin",
      expect.objectContaining({ method: "POST" })
    );
  });
});
