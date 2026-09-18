import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginScreen } from "./LoginScreen";

describe("LoginScreen", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ id: 1, email: "a@example.com" }), {
            status: 200,
          })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the signup endpoint and passes the created user to onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<LoginScreen onSuccess={onSuccess} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("tab", { name: "Sign up" }));
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(onSuccess).toHaveBeenCalledWith({ id: 1, email: "a@example.com" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/signup",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows the server's error message and does not call onSuccess when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ detail: "Invalid email or password." }), {
            status: 401,
          })
      )
    );
    const onSuccess = vi.fn();
    render(<LoginScreen onSuccess={onSuccess} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
