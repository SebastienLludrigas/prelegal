"use client";

import { useState, type FormEvent } from "react";
import type { SessionUser } from "@/lib/auth/types";

type Mode = "signin" | "signup";

export function LoginScreen({
  onSuccess,
}: {
  onSuccess: (user: SessionUser) => void;
}) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail ?? "Something went wrong. Please try again.");
      }
      onSuccess(await response.json());
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm rounded-[3px] border border-panel-line bg-paper px-8 py-9">
        <p className="text-[13px] font-medium text-ink-soft">Prelegal</p>
        <h1 className="mt-1 font-serif text-[22px] text-ink">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>

        <div className="mt-6 flex border-b border-panel-line" role="tablist">
          {(["signin", "signup"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => setMode(tab)}
              className={`flex-1 px-4 py-2.5 text-[13.5px] font-medium ${
                mode === tab
                  ? "border-b-2 border-accent text-ink"
                  : "text-ink-soft"
              }`}
            >
              {tab === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-[13.5px] text-ink-soft">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-[3px] border border-panel-line bg-white px-3 py-2 text-[14px] text-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13.5px] text-ink-soft">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[3px] border border-panel-line bg-white px-3 py-2 text-[14px] text-ink"
            />
          </label>

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-[3px] bg-accent px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#5b2c70] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
