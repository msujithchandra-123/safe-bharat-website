import { logger } from "@/lib/logger";
import { normaliseText } from "@/lib/validation/enquiry";
import { EMERGENCY_REPLY, isEmergencyMessage } from "@/lib/ai/emergency";
import { formatKnowledge, type KnowledgeIndex } from "@/lib/ai/knowledge";
import { OUTPUT_JSON_SCHEMA, POLICY_MARKER, SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { CHAT_LIMITS, ChatProviderError, modelOutputSchema, type ChatLink, type ChatMessage, type ChatProvider, type ChatReply } from "@/lib/ai/types";

export interface ChatServiceDeps {
  provider: ChatProvider | null;
  knowledge: KnowledgeIndex;
  /** Strings that must never appear in a reply (e.g. the provider API key). */
  secrets?: string[];
  timeoutMs?: number;
}

export class ChatUnavailableError extends Error {
  /** "busy" is temporary (provider rate limit, outage, timeout); the others need configuration fixes. */
  constructor(readonly reason: "not-configured" | "provider-error" | "busy") {
    super(`Chat unavailable: ${reason}`);
    this.name = "ChatUnavailableError";
  }
}

const FALLBACK_REPLY =
  "I'm sorry, I can't help with that here. For anything specific to your site, the Safe Bharat team can help directly by phone or email.";

const LEAK_REPLY = "I can't share that. I'm happy to help with Safe Bharat's services, equipment or a quotation request.";

/** Removes markup the UI would not render and caps the length. */
export function cleanReply(text: string): string {
  const cleaned = normaliseText(text)
    .replace(/<[^>]{1,200}>/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n");
  return cleaned.length > CHAT_LIMITS.maxReplyChars ? `${cleaned.slice(0, CHAT_LIMITS.maxReplyChars - 1).trimEnd()}…` : cleaned;
}

function containsLeak(reply: string, secrets: string[]): boolean {
  if (reply.includes(POLICY_MARKER)) return true;
  if (/visitor_message|<knowledge>|Rules about (facts|actions)/i.test(reply)) return true;
  return secrets.some((s) => s.length >= 8 && reply.includes(s));
}

export function emergencyReply(): ChatReply {
  logger.info("chat.emergency_guidance");
  return { kind: "emergency", reply: EMERGENCY_REPLY, action: "show_contact_options", service: null, links: [] };
}

export function sanitiseHistory(messages: ChatMessage[]): ChatMessage[] {
  const cleaned = messages.map((m) => ({ role: m.role, content: normaliseText(m.content) })).filter((m) => m.content.length > 0);
  // The conversation sent to the model must start with a visitor message.
  while (cleaned.length > 0 && cleaned[0]?.role !== "user") cleaned.shift();
  return cleaned.slice(-CHAT_LIMITS.maxMessages);
}

export async function generateChatReply(messages: ChatMessage[], deps: ChatServiceDeps): Promise<ChatReply> {
  const history = sanitiseHistory(messages);
  const latest = history.at(-1);
  if (!latest || latest.role !== "user") throw new Error("No visitor message");

  // Emergencies are handled deterministically and never depend on the AI provider.
  if (isEmergencyMessage(latest.content)) return emergencyReply();

  if (!deps.provider) throw new ChatUnavailableError("not-configured");

  const recentUserText = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");
  const docs = deps.knowledge.retrieve(recentUserText, 5);

  const started = performance.now();
  let result;
  try {
    result = await deps.provider.generate(
      { system: SYSTEM_PROMPT, messages: history, knowledge: formatKnowledge(docs), outputSchema: OUTPUT_JSON_SCHEMA },
      { signal: AbortSignal.timeout(deps.timeoutMs ?? 30_000) },
    );
  } catch (error) {
    logger.warn("chat.provider_error", {
      provider: deps.provider.name,
      kind: error instanceof ChatProviderError ? error.kind : error instanceof Error ? error.name : "unknown",
    });
    const permanent = error instanceof ChatProviderError && (error.kind === "auth" || error.kind === "bad_request");
    throw new ChatUnavailableError(permanent ? "provider-error" : "busy");
  }

  const latencyMs = Math.round(performance.now() - started);
  let parsed = null;
  if (result.outputText) {
    try {
      const candidate = modelOutputSchema.safeParse(JSON.parse(result.outputText));
      if (candidate.success) parsed = candidate.data;
    } catch {
      parsed = null;
    }
  }

  logger.info("chat.completed", {
    provider: deps.provider.name,
    model: result.model,
    latencyMs,
    stopReason: result.stopReason,
    inputTokens: result.usage?.inputTokens,
    outputTokens: result.usage?.outputTokens,
    retrieved: docs.length,
    valid: Boolean(parsed),
  });

  if (!parsed) {
    return { kind: "answer", reply: FALLBACK_REPLY, action: "show_contact_options", service: null, links: [] };
  }

  const reply = cleanReply(parsed.reply);
  if (!reply || containsLeak(reply, deps.secrets ?? [])) {
    logger.warn("chat.reply_blocked");
    return { kind: "answer", reply: LEAK_REPLY, action: "none", service: null, links: [] };
  }

  // Only links to documents that were actually retrieved, and therefore exist, are shown.
  const retrievedIds = new Set(docs.map((d) => d.id));
  const links: ChatLink[] = [];
  for (const id of parsed.sources) {
    if (!retrievedIds.has(id)) continue;
    const doc = deps.knowledge.get(id);
    if (!doc || links.some((l) => l.href === doc.url) || doc.id === "company-core" || doc.id === "enquiry-process") continue;
    links.push({ label: doc.title, href: doc.url });
    if (links.length >= 3) break;
  }

  return {
    kind: "answer",
    reply,
    action: parsed.action,
    service: parsed.service === "none" ? null : parsed.service,
    links,
  };
}
