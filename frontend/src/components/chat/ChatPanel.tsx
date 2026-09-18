"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatApiResponse, ChatMessage } from "@/lib/chat/types";

const GREETING: ChatMessage = {
  role: "assistant",
  content: "What legal document would you like to create today?",
};

async function postChatTurn(
  history: ChatMessage[],
  documentType: string | null
): Promise<ChatApiResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history, documentType }),
  });
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.json();
}

export function ChatPanel({
  onDocumentTypeResolved,
  onFieldsExtracted,
}: {
  onDocumentTypeResolved: (documentType: string) => void;
  onFieldsExtracted: (documentType: string, fields: Record<string, unknown>) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    let history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setDraft("");
    setError(null);
    setSubmitting(true);

    try {
      let turn = await postChatTurn(history, documentType);
      history = [...history, { role: "assistant" as const, content: turn.reply }];

      let resolvedType = documentType;
      if (!resolvedType && turn.documentType) {
        resolvedType = turn.documentType;
        setDocumentType(resolvedType);
        onDocumentTypeResolved(resolvedType);
        // The document type just became known: continue the same conversation
        // right away so the assistant can ask its first real question about it.
        turn = await postChatTurn(history, resolvedType);
        history = [...history, { role: "assistant" as const, content: turn.reply }];
      }

      setMessages(history);
      if (resolvedType && turn.fields) {
        onFieldsExtracted(resolvedType, turn.fields);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
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
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-[13px] text-red-700">{error}</p>}

      <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">
          Message
        </label>
        <input
          ref={inputRef}
          id="chat-message"
          autoFocus
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
