"use client";

import { useState, type FormEvent } from "react";
import type { ChatMessage, ChatTurnResult, NdaFieldsPatch } from "@/lib/chat/types";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Let's set up your Mutual NDA. To start, what's the name of your company (Party One)?",
};

export function ChatPanel({
  onFieldsExtracted,
}: {
  onFieldsExtracted: (patch: NdaFieldsPatch) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setDraft("");
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      const result: ChatTurnResult = await response.json();
      setMessages([...history, { role: "assistant", content: result.reply }]);
      onFieldsExtracted(result.fields);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((message, index) => (
          <p
            key={index}
            className={
              message.role === "assistant"
                ? "rounded-[3px] bg-panel px-3 py-2 text-[13.5px] text-ink"
                : "rounded-[3px] bg-accent/10 px-3 py-2 text-[13.5px] text-ink"
            }
          >
            {message.content}
          </p>
        ))}
      </div>

      {error && <p className="mt-2 text-[13px] text-red-700">{error}</p>}

      <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">
          Message
        </label>
        <input
          id="chat-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="flex-1 rounded-[3px] border border-panel-line bg-white px-3 py-2 text-[14px] text-ink"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[3px] bg-accent px-4 py-2 text-[14px] font-medium text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
