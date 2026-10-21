import type { EmailSender, OutgoingEmail, SendResult } from "@/lib/email/email-service";
import type { ChatProvider, ProviderRequest, ProviderResult } from "@/lib/ai/types";
import type { AttachmentStorage, ValidatedAttachment } from "@/lib/storage/attachments";

/** Records every email instead of sending it. `fail` makes every send fail. */
export class FakeEmailSender implements EmailSender {
  readonly configured: boolean;
  sent: OutgoingEmail[] = [];
  fail = false;
  constructor(configured = true) {
    this.configured = configured;
  }
  async send(email: OutgoingEmail): Promise<SendResult> {
    if (this.fail) return { ok: false, error: "simulated provider outage" };
    this.sent.push(email);
    return { ok: true, providerId: `fake-${this.sent.length}` };
  }
}

/** Stub LLM provider: no network, no cost. Returns the configured output and records requests. */
export class StubChatProvider implements ChatProvider {
  readonly name = "stub";
  readonly model = "stub-model";
  requests: ProviderRequest[] = [];
  constructor(private readonly respond: (req: ProviderRequest) => string | null | Error = () => JSON.stringify({ reply: "ok", action: "none", service: "none", sources: [] })) {}
  async generate(request: ProviderRequest): Promise<ProviderResult> {
    this.requests.push(request);
    const out = this.respond(request);
    if (out instanceof Error) throw out;
    return { outputText: out, stopReason: "end_turn", model: this.model, usage: { inputTokens: 10, outputTokens: 5 } };
  }
}

export class FakeStorage implements AttachmentStorage {
  stored = new Map<string, ValidatedAttachment>();
  removed: string[] = [];
  async put(file: ValidatedAttachment) {
    const storageKey = `enquiries/test/${this.stored.size + 1}${file.extension}`;
    this.stored.set(storageKey, file);
    return { storageKey };
  }
  async remove(storageKey: string) {
    this.removed.push(storageKey);
    this.stored.delete(storageKey);
  }
}

export function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "203.0.113.10", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

export const validQuote = {
  enquiryType: "QUOTE",
  fullName: "Ravi Kumar",
  email: "ravi@example.com",
  phone: "+91 98765 43210",
  companyName: "Example Industries",
  siteLocation: "Autonagar, Visakhapatnam",
  serviceRequired: "fire-alarm-systems",
  message: "Need an addressable fire alarm system for a two-storey office.",
  consent: true,
} as const;
