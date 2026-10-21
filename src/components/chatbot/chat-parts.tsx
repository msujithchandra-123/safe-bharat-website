"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Mail, MessageCircle, Phone, Send, Siren, ThumbsDown, ThumbsUp } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/config/site";
import { CHAT_LIMITS } from "@/lib/ai/types";
import { cn } from "@/components/ui/primitives";
import type { UiMessage } from "@/components/chatbot/chat-types";

/** Renders plain text with "- " bullet lines. React escapes everything; no HTML is ever injected. */
function FormattedText({ text }: { text: string }) {
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];
  for (const line of text.split("\n")) {
    const bullet = /^\s*[-•]\s+(.*)$/.exec(line);
    const last = blocks.at(-1);
    if (bullet) {
      if (last?.type === "ul") last.lines.push(bullet[1] ?? "");
      else blocks.push({ type: "ul", lines: [bullet[1] ?? ""] });
    } else if (line.trim() === "") {
      blocks.push({ type: "p", lines: [] });
    } else if (last?.type === "p" && last.lines.length > 0) {
      last.lines.push(line);
    } else {
      blocks.push({ type: "p", lines: [line] });
    }
  }
  return (
    <div className="space-y-2">
      {blocks
        .filter((b) => b.lines.length > 0)
        .map((b, i) =>
          b.type === "ul" ? (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.lines.map((l, j) => (
                <li key={j}>{l}</li>
              ))}
            </ul>
          ) : (
            <p key={i}>{b.lines.join(" ")}</p>
          ),
        )}
    </div>
  );
}

export function ChatMessage({
  message,
  onAction,
  feedback,
}: {
  message: Extract<UiMessage, { role: "user" | "assistant" }>;
  onAction?: (action: NonNullable<Extract<UiMessage, { role: "assistant" }>["action"]>, service?: string | null) => void;
  feedback?: React.ReactNode;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-navy-900 px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-white">
          <span className="sr-only">You: </span>
          {message.content}
        </p>
      </div>
    );
  }
  const emergency = message.kind === "emergency";
  const actionLabel: Partial<Record<NonNullable<typeof message.action>, string>> = {
    open_quote_form: "Start a quote request",
    open_amc_form: "Start an AMC request",
    open_callback_form: "Request a callback",
    show_contact_options: "Contact our team",
  };
  return (
    <div className="flex flex-col items-start gap-2">
      <div
        className={cn(
          "max-w-[92%] rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] leading-relaxed",
          emergency ? "border border-brand-red/40 bg-brand-red-50 text-ink" : "bg-mist text-ink",
        )}
      >
        <span className="sr-only">Safe Bharat Assistant: </span>
        {emergency ? (
          <p className="mb-2 flex items-center gap-2 font-bold text-brand-red-dark">
            <Siren className="size-4" aria-hidden="true" /> Emergency guidance
          </p>
        ) : null}
        <FormattedText text={message.content} />
        {emergency ? (
          <a href="tel:112" className="mt-3 inline-flex items-center gap-2 rounded-md bg-brand-red px-4 py-2 font-bold text-white">
            <Phone className="size-4" aria-hidden="true" /> Call 112
          </a>
        ) : null}
      </div>
      {message.links && message.links.length > 0 ? (
        <ul className="flex max-w-[92%] flex-wrap gap-1.5" aria-label="Related pages">
          {message.links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-navy-900 hover:border-navy-900">
                {l.label} <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {message.action && message.action !== "none" && actionLabel[message.action] && onAction && !emergency ? (
        <button
          type="button"
          onClick={() => onAction(message.action!, message.service)}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          {actionLabel[message.action]} <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      ) : null}
      {feedback}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted" role="status">
      <span className="flex gap-1 rounded-2xl rounded-bl-sm bg-mist px-4 py-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 animate-bounce rounded-full bg-navy-700/60" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span className="sr-only">Safe Bharat Assistant is typing</span>
    </div>
  );
}

export interface QuickReply {
  label: string;
  /** Sent to the assistant when it is available. */
  message?: string;
  /** Handled locally without the AI (works even when the assistant is offline). */
  local?: "quote" | "handoff";
  /** Destination used when the assistant is offline. */
  fallbackHref?: string;
}

export const QUICK_REPLIES: QuickReply[] = [
  { label: "Explore Fire Protection Systems", message: "What fire protection systems do you provide?", fallbackHref: "/services/fire-protection-systems" },
  { label: "Learn About AMC Services", message: "What does an AMC from Safe Bharat cover?", fallbackHref: "/services/amc-maintenance" },
  { label: "Browse Fire Safety Equipment", message: "What fire safety equipment do you supply?", fallbackHref: "/equipment" },
  { label: "Request a Quotation", local: "quote" },
  { label: "Talk to Our Team", local: "handoff" },
];

export function SuggestedQuestions({ onSelect, available }: { onSelect: (q: QuickReply) => void; available: boolean }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted">Suggested</p>
      <ul className="flex flex-wrap gap-2">
        {QUICK_REPLIES.map((q) =>
          !available && !q.local && q.fallbackHref ? (
            <li key={q.label}>
              <Link href={q.fallbackHref} className="inline-block rounded-full border border-line-strong bg-white px-3 py-1.5 text-sm font-medium text-navy-900 hover:border-navy-900">
                {q.label}
              </Link>
            </li>
          ) : (
            <li key={q.label}>
              <button
                type="button"
                onClick={() => onSelect(q)}
                className="rounded-full border border-line-strong bg-white px-3 py-1.5 text-left text-sm font-medium text-navy-900 hover:border-navy-900 hover:bg-navy-50"
              >
                {q.label}
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

export function ChatInput({ onSend, disabled, autoFocus }: { onSend: (text: string) => void; disabled: boolean; autoFocus?: boolean }) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };
  const remaining = CHAT_LIMITS.maxUserChars - value.length;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2"
    >
      <label htmlFor={id} className="sr-only">
        Message Safe Bharat Assistant
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={1}
        value={value}
        maxLength={CHAT_LIMITS.maxUserChars}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your question…"
        aria-describedby={`${id}-hint`}
        className="max-h-36 min-h-11 flex-1 resize-none rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[15px] leading-snug focus:border-navy-700 focus:outline-2 focus:outline-navy-700/25"
      />
      <span id={`${id}-hint`} className="sr-only">
        Press Enter to send, Shift and Enter for a new line. {remaining < 100 ? `${remaining} characters left.` : ""}
      </span>
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        aria-label="Send message"
        className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-red text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50"
      >
        <Send className="size-5" aria-hidden="true" />
      </button>
    </form>
  );
}

export function ChatbotFeedback({ kind }: { kind: "answer" | "emergency" }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const send = async (rating: "up" | "down") => {
    setState("sending");
    try {
      const res = await fetch("/api/v1/chat/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, kind }) });
      setState(res.ok ? "done" : "failed");
    } catch {
      setState("failed");
    }
  };
  if (state === "done") return <p className="text-xs text-muted">Thanks for your feedback.</p>;
  return (
    <div className="flex items-center gap-1 text-muted">
      <span className="sr-only">Was this answer helpful?</span>
      <button type="button" disabled={state === "sending"} onClick={() => send("up")} className="grid size-7 place-items-center rounded hover:bg-mist hover:text-navy-900" aria-label="Helpful">
        <ThumbsUp className="size-3.5" aria-hidden="true" />
      </button>
      <button type="button" disabled={state === "sending"} onClick={() => send("down")} className="grid size-7 place-items-center rounded hover:bg-mist hover:text-navy-900" aria-label="Not helpful">
        <ThumbsDown className="size-3.5" aria-hidden="true" />
      </button>
      {state === "failed" ? <span className="text-xs">Couldn&apos;t send feedback.</span> : null}
    </div>
  );
}

/** Direct contact routes. Nothing here claims that anyone has been notified. */
export function HumanHandoff({ onCallback }: { onCallback: () => void }) {
  const wa = whatsappUrl("Hello Safe Bharat, I was using the website assistant and would like to speak to the team.");
  return (
    <div className="w-full rounded-xl border border-line bg-white p-4">
      <p className="font-heading text-sm font-bold text-navy-900">Talk to the Safe Bharat team</p>
      <p className="mt-1 text-sm text-body">Reach us directly, or leave your details and we will call you back.</p>
      <ul className="mt-3 space-y-2 text-sm">
        {siteConfig.contact.phones.map((p) => (
          <li key={p.tel}>
            <a href={`tel:${p.tel}`} className="inline-flex items-center gap-2 font-semibold text-navy-900 hover:text-brand-red">
              <Phone className="size-4" aria-hidden="true" /> {p.display}
            </a>
          </li>
        ))}
        <li>
          <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-2 font-semibold break-all text-navy-900 hover:text-brand-red">
            <Mail className="size-4" aria-hidden="true" /> {siteConfig.contact.email}
          </a>
        </li>
        {wa ? (
          <li>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-navy-900 hover:text-brand-red">
              <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
            </a>
          </li>
        ) : null}
      </ul>
      <button type="button" onClick={onCallback} className="mt-4 w-full rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">
        Request a callback
      </button>
    </div>
  );
}
