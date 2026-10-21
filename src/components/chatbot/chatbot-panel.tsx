"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headset, Minus, X } from "lucide-react";
import type { ApiResponse } from "@/lib/api/response";
import type { ChatAction, ChatReply } from "@/lib/ai/types";
import { ChatbotFeedback, ChatInput, ChatMessage, HumanHandoff, SuggestedQuestions, TypingIndicator, type QuickReply } from "@/components/chatbot/chat-parts";
import { uid, WELCOME, type LeadType, type UiMessage } from "@/components/chatbot/chat-types";
import { LeadCaptureForm } from "@/components/chatbot/lead-capture-form";

/**
 * unknown: status not yet checked · configured: a key is set but no reply has succeeded yet ·
 * online: a real reply has come back from the provider · unavailable: not configured or failing.
 */
type Availability = "unknown" | "configured" | "online" | "unavailable";

/** Slightly longer than the server's 30 s provider timeout. */
const CHAT_CLIENT_TIMEOUT_MS = 40_000;

const LEAD_CONFIRMATION: Record<LeadType, string> = {
  QUOTE: "Your quotation request has been submitted",
  AMC: "Your AMC request has been submitted",
  CALLBACK: "Your callback request has been submitted",
};

function initialMessages(): UiMessage[] {
  return [{ id: uid(), role: "assistant", kind: "welcome", content: WELCOME }];
}

/** Messages the model may see: real visitor turns and real assistant answers only. */
function toApiHistory(messages: UiMessage[]) {
  return messages
    .filter((m): m is Extract<UiMessage, { role: "user" | "assistant" }> => m.role === "user" || (m.role === "assistant" && (m.kind === "answer" || m.kind === "emergency")))
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2400) }))
    .slice(-12);
}

export function ChatbotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<UiMessage[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; retryText: string } | null>(null);
  const [availability, setAvailability] = useState<Availability>("unknown");
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || availability !== "unknown") return;
    let cancelled = false;
    fetch("/api/v1/chat/status")
      .then((r) => r.json() as Promise<ApiResponse<{ available: boolean }>>)
      .then((j) => !cancelled && setAvailability(j.ok && j.data.available ? "configured" : "unavailable"))
      .catch(() => !cancelled && setAvailability("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [open, availability]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelRef.current?.contains(document.activeElement)) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, pending, error]);

  const append = (...m: UiMessage[]) => setMessages((prev) => [...prev, ...m]);

  /** Only one form widget is active at a time. */
  const openWidget = useCallback((widget: UiMessage) => {
    setMessages((prev) => [...prev.filter((m) => m.role !== "widget"), widget]);
  }, []);

  const openLead = useCallback(
    (leadType: LeadType, service?: string | null) => {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      openWidget({ id: uid(), role: "widget", widget: "lead", leadType, service, prefill: lastUser?.role === "user" ? lastUser.content : undefined });
    },
    [messages, openWidget],
  );

  const handleAction = (action: ChatAction, service?: string | null) => {
    if (action === "open_quote_form") openLead("QUOTE", service);
    else if (action === "open_amc_form") openLead("AMC", service);
    else if (action === "open_callback_form") openLead("CALLBACK");
    else if (action === "show_contact_options") openWidget({ id: uid(), role: "widget", widget: "handoff" });
  };

  const send = async (text: string, existing?: UiMessage[]) => {
    setError(null);
    const base = existing ?? [...messages, { id: uid(), role: "user", content: text } as UiMessage];
    if (!existing) setMessages(base);
    setPending(true);
    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiHistory(base) }),
        signal: AbortSignal.timeout(CHAT_CLIENT_TIMEOUT_MS),
      });
      const json = (await res.json().catch(() => null)) as ApiResponse<ChatReply> | null;
      if (json?.ok) {
        const r = json.data;
        append({ id: uid(), role: "assistant", kind: r.kind, content: r.reply, action: r.action, service: r.service, links: r.links });
        // Emergency guidance is generated locally without the AI provider, so it does not prove the assistant is online.
        if (r.kind === "answer") setAvailability("online");
        if (r.kind === "emergency") openWidget({ id: uid(), role: "widget", widget: "handoff" });
      } else if (json && !json.ok && json.error.code === "CHAT_UNAVAILABLE") {
        setAvailability("unavailable");
        append({ id: uid(), role: "assistant", kind: "notice", content: json.error.message });
        openWidget({ id: uid(), role: "widget", widget: "handoff" });
      } else {
        // CHAT_BUSY, RATE_LIMITED and other temporary failures: offer a retry without marking the assistant offline.
        setError({ message: json && !json.ok ? json.error.message : "The assistant did not respond. Please try again.", retryText: text });
      }
    } catch (err) {
      const timedOut = err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
      setError({
        message: timedOut ? "The assistant took too long to respond. Please try again." : "We could not reach the assistant. Check your connection and try again.",
        retryText: text,
      });
    } finally {
      setPending(false);
    }
  };

  const onQuickReply = (q: QuickReply) => {
    if (q.local === "quote") return openLead("QUOTE");
    if (q.local === "handoff") return openWidget({ id: uid(), role: "widget", widget: "handoff" });
    if (q.message) void send(q.message);
  };

  const reset = () => {
    setMessages(initialMessages());
    setError(null);
  };

  const showSuggestions = !messages.some((m) => m.role === "user" || m.role === "widget");
  const inputDisabled = pending || availability === "unavailable";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="sb-chat-title"
          className="fixed inset-x-2 top-16 bottom-2 z-50 flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 sm:h-[min(680px,calc(100dvh-6rem))] sm:w-[400px]"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="flex items-center gap-3 bg-navy-900 px-4 py-3 text-white">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white p-1">
              <Image src="/brand/safe-bharat-emblem.png" alt="" width={320} height={381} className="h-8 w-auto" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="sb-chat-title" className="truncate font-heading text-base font-bold text-white">
                Safe Bharat Assistant
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-white/75">
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${availability === "online" ? "bg-emerald-400" : availability === "unavailable" ? "bg-white/40" : "bg-amber-300"}`}
                />
                AI assistant{availability === "unavailable" ? " · offline" : availability === "online" ? " · online" : availability === "unknown" ? " · checking…" : ""}
              </p>
            </div>
            <button type="button" onClick={() => openWidget({ id: uid(), role: "widget", widget: "handoff" })} className="grid size-9 place-items-center rounded-md hover:bg-white/10" aria-label="Talk to our team">
              <Headset className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md hover:bg-white/10" aria-label="Minimise chat">
              <Minus className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="grid size-9 place-items-center rounded-md hover:bg-white/10"
              aria-label="Close chat and clear conversation"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite" aria-relevant="additions">
            {messages.map((m) => {
              if (m.role === "widget") {
                return m.widget === "handoff" ? (
                  <HumanHandoff key={m.id} onCallback={() => openLead("CALLBACK")} />
                ) : (
                  <LeadCaptureForm
                    key={m.id}
                    leadType={m.leadType}
                    service={m.service}
                    prefill={m.prefill}
                    onCancel={() => setMessages((prev) => prev.filter((x) => x.id !== m.id))}
                    onSubmitted={(ref, type) =>
                      setMessages((prev) => [
                        ...prev.filter((x) => x.id !== m.id),
                        {
                          id: uid(),
                          role: "assistant",
                          kind: "notice",
                          content: `${LEAD_CONFIRMATION[type]}. Your reference number is ${ref}. The Safe Bharat team will review it and contact you. This is not a quotation.`,
                        },
                      ])
                    }
                  />
                );
              }
              return (
                <ChatMessage
                  key={m.id}
                  message={m}
                  onAction={handleAction}
                  feedback={m.role === "assistant" && (m.kind === "answer" || m.kind === "emergency") ? <ChatbotFeedback kind={m.kind} /> : null}
                />
              );
            })}
            {availability === "unavailable" && !messages.some((m) => m.role === "widget") ? (
              <p className="rounded-lg bg-mist p-3 text-sm text-body">
                The AI assistant is offline right now. You can still request a quotation below, or contact our team directly.
              </p>
            ) : null}
            {showSuggestions ? <SuggestedQuestions onSelect={onQuickReply} available={availability !== "unavailable"} /> : null}
            {pending ? <TypingIndicator /> : null}
            {error ? (
              <div role="alert" className="rounded-lg border border-brand-red/30 bg-brand-red-50 p-3 text-sm">
                <p className="text-ink">{error.message}</p>
                <button type="button" onClick={() => void send(error.retryText, messages)} className="mt-2 font-semibold text-navy-900 underline">
                  Retry
                </button>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-line bg-white px-4 pt-3 pb-3">
            {availability === "unavailable" ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => openLead("QUOTE")} className="flex-1 rounded-md bg-brand-red px-3 py-2.5 text-sm font-semibold text-white">
                  Request a quotation
                </button>
                <button type="button" onClick={() => openWidget({ id: uid(), role: "widget", widget: "handoff" })} className="flex-1 rounded-md border border-line-strong px-3 py-2.5 text-sm font-semibold text-navy-900">
                  Contact the team
                </button>
              </div>
            ) : (
              <ChatInput onSend={(t) => void send(t)} disabled={inputDisabled} autoFocus={open} />
            )}
            <p className="mt-2 text-[11px] leading-snug text-muted">
              AI assistant: answers may be incomplete. Please don&apos;t share sensitive personal information. Conversations are not stored. Not
              for emergencies: call 112.{" "}
              <Link href="/privacy-policy" className="underline">
                Privacy
              </Link>
            </p>
          </footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
