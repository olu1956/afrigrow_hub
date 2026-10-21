"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
const exampleQuestions = [
  "What is AfriGrow Hub?",
  "Is founding membership free?",
  "How do I appear in the directory?",
  "Does AfriGrow guarantee funding?",
  "How do I contact a person?",
] as const;

type Source = { title: string; href: string };

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

type HelpChatProps = {
  privacyHref: string;
  supportHref: string;
  providerConfigured: boolean;
};

export function HelpChat({ privacyHref, supportHref, providerConfigured }: HelpChatProps) {
  const inputId = useId();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, pending, error]);

  async function sendText(text: string) {
    const content = text.trim();
    if (!content || pending) return;

    const history = [...messages, { id: crypto.randomUUID(), role: "user" as const, content }];
    setMessages(history);
    setDraft("");
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(-8).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const payload = (await response.json()) as {
        reply?: string;
        sources?: Source[];
        error?: string;
      };

      if (!response.ok || !payload.reply) {
        setError(payload.error ?? "The assistant could not answer just now.");
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.reply ?? "",
          sources: payload.sources ?? [],
        },
      ]);
    } catch {
      setError("The assistant could not be reached. Check your connection, or contact the team.");
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendText(draft);
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">AI assistant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Ask AfriGrow
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          You are chatting with an AI assistant. It can explain how AfriGrow Hub works and share
          general notes from AfriGrow pages: profiles, marketing, matching, funding readiness, and
          how to reach the team.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          {providerConfigured
            ? "When a model is connected, it may only use those page excerpts. "
            : "No AI model is connected in this environment, so replies stay limited to those excerpts. "}
          AfriGrow approved these excerpts on 21 October 2026. Review is due on 21 January 2027.
          This is not legal, tax, or financial advice. It cannot see your account, submit an application, or decide if you
          qualify for funding.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground" id="example-questions-label">
          Example questions
        </p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-labelledby="example-questions-label">
          {exampleQuestions.map((question) => (
            <li key={question}>
              <button
                type="button"
                className="rounded-full border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                onClick={() => void sendText(question)}
                disabled={pending}
              >
                {question}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="min-h-48 space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={pending}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted">Your conversation will appear here. It is not saved.</p>
        ) : null}
        {messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "ml-6 rounded-2xl bg-primary-light px-4 py-3 sm:ml-16"
                : "mr-6 rounded-2xl border border-border px-4 py-3 sm:mr-10"
            }
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {message.role === "user" ? "You" : "AfriGrow AI"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {message.content}
            </p>
            {message.sources && message.sources.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted">Sources</p>
                <ul className="mt-1 space-y-1">
                  {message.sources.map((source) => (
                    <li key={`${message.id}-${source.href}`}>
                      <Link
                        href={source.href}
                        className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {source.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
        {pending ? (
          <p className="text-sm text-muted" role="status">
            Drafting a reply…
          </p>
        ) : null}
        <div ref={endRef} />
      </div>

      {error ? (
        <p className="rounded-xl border border-accent/40 bg-accent-light px-4 py-3 text-sm text-foreground" role="alert">
          {error}{" "}
          <Link href={supportHref} className="font-semibold text-primary hover:underline">
            Contact the team
          </Link>
          .
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          Your question
        </label>
        <textarea
          ref={inputRef}
          id={inputId}
          name="question"
          rows={3}
          value={draft}
          maxLength={1200}
          disabled={pending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendText(draft);
            }
          }}
          placeholder="Ask a general question about AfriGrow Hub"
          className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-base text-foreground outline-none ring-primary placeholder:text-muted focus:ring-2 disabled:opacity-60"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted">
            Press Enter to send. Shift+Enter adds a line. Do not enter passwords, bank details, or
            confidential information.{" "}
            <Link href={privacyHref} className="font-semibold text-primary hover:underline">
              Privacy notice
            </Link>
            .{" "}
            <Link href={supportHref} className="font-semibold text-primary hover:underline">
              Talk to a person
            </Link>
            .
          </p>
          <button
            type="submit"
            disabled={pending || draft.trim().length === 0}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
