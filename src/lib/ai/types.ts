import { z } from "zod";
import { services } from "@/content/services";

export const CHAT_ACTIONS = ["none", "open_quote_form", "open_amc_form", "open_callback_form", "show_contact_options"] as const;
export type ChatAction = (typeof CHAT_ACTIONS)[number];

export const CHAT_SERVICE_VALUES = ["none", ...services.map((s) => s.slug)] as [string, ...string[]];

export const CHAT_LIMITS = {
  maxMessages: 12,
  maxUserChars: 1000,
  maxAssistantChars: 2400,
  maxTotalChars: 12000,
  maxReplyChars: 1800,
} as const;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(CHAT_LIMITS.maxAssistantChars),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z
  .object({ messages: z.array(chatMessageSchema).min(1).max(CHAT_LIMITS.maxMessages) })
  .superRefine((value, ctx) => {
    const last = value.messages.at(-1);
    if (!last || last.role !== "user") ctx.addIssue({ code: "custom", message: "The last message must be from the user." });
    for (const [i, m] of value.messages.entries()) {
      if (m.role === "user" && m.content.length > CHAT_LIMITS.maxUserChars) {
        ctx.addIssue({ code: "custom", path: ["messages", i, "content"], message: `Messages must be ${CHAT_LIMITS.maxUserChars} characters or fewer.` });
      }
    }
    const total = value.messages.reduce((n, m) => n + m.content.length, 0);
    if (total > CHAT_LIMITS.maxTotalChars) ctx.addIssue({ code: "custom", message: "Conversation is too long. Please start a new chat." });
  });

/** Structured output the model must return. */
export const modelOutputSchema = z.object({
  reply: z.string().min(1),
  action: z.enum(CHAT_ACTIONS),
  service: z.enum(CHAT_SERVICE_VALUES),
  sources: z.array(z.string()).max(8),
});
export type ModelOutput = z.infer<typeof modelOutputSchema>;

export interface ChatLink {
  label: string;
  href: string;
}

export interface ChatReply {
  kind: "answer" | "emergency";
  reply: string;
  action: ChatAction;
  service: string | null;
  links: ChatLink[];
}

export interface ProviderRequest {
  system: string;
  messages: ChatMessage[];
  /** Retrieved company knowledge, delivered alongside the latest user turn. */
  knowledge: string;
  outputSchema: Record<string, unknown>;
}

export interface ProviderResult {
  /** Raw JSON text produced by the model, validated by the chat service. */
  outputText: string | null;
  stopReason: string | null;
  usage?: { inputTokens: number; outputTokens: number };
  model: string;
}

/** Swap providers by implementing this interface; nothing else depends on the vendor SDK. */
export interface ChatProvider {
  readonly name: string;
  readonly model: string;
  generate(request: ProviderRequest, options?: { signal?: AbortSignal }): Promise<ProviderResult>;
}

export class ChatProviderError extends Error {
  constructor(
    message: string,
    readonly kind: "rate_limited" | "auth" | "unavailable" | "bad_request",
  ) {
    super(message);
    this.name = "ChatProviderError";
  }
}
