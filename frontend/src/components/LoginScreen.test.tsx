import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginScreen } from "./LoginScreen";

describe("LoginScreen", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ status: "ok" }), { status: 200 }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the signup endpoint when signing up", async () => {
    const onSuccess = vi.fn();
    render(<LoginScreen onSuccess={onSuccess} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("tab", { name: "Sign up" }));
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(onSuccess).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/signup",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows an error and does not call onSuccess when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 }))
    );
    const onSuccess = vi.fn();
    render(<LoginScreen onSuccess={onSuccess} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
