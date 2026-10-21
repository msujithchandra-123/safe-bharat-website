import { Resend } from "resend";
import type { RenderedEmail } from "@/lib/email/templates";

export interface OutgoingEmail extends RenderedEmail {
  to: string[];
  replyTo?: string;
  /** Prevents duplicate delivery when the same notification is retried. */
  idempotencyKey: string;
}

export type SendResult = { ok: true; providerId: string | null } | { ok: false; error: string };

export interface EmailSender {
  readonly configured: boolean;
  send(email: OutgoingEmail): Promise<SendResult>;
}

/** Sends from the verified business domain; the customer's address is only ever used as Reply-To. */
export class ResendEmailSender implements EmailSender {
  readonly configured = true;
  private client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
    /** A slow provider must not hold the visitor's request open; the retry job resends later. */
    private readonly timeoutMs = 10_000,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(email: OutgoingEmail): Promise<SendResult> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<SendResult>((resolve) => {
      timer = setTimeout(() => resolve({ ok: false, error: `Timeout after ${this.timeoutMs}ms` }), this.timeoutMs);
    });
    try {
      return await Promise.race([this.deliver(email), timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  private async deliver(email: OutgoingEmail): Promise<SendResult> {
    try {
      // The idempotency key makes a retry after a timeout safe: Resend will not send the same message twice.
      const { data, error } = await this.client.emails.send(
        {
          from: this.from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          ...(email.replyTo ? { replyTo: email.replyTo } : {}),
        },
        { idempotencyKey: email.idempotencyKey },
      );
      if (error) return { ok: false, error: `${error.name}: ${error.message}`.slice(0, 480) };
      return { ok: true, providerId: data?.id ?? null };
    } catch (error) {
      return { ok: false, error: (error instanceof Error ? error.name : "UnknownError").slice(0, 480) };
    }
  }
}

/** Used when email credentials are absent. Enquiries are still saved and can be sent later by the retry job. */
export class UnconfiguredEmailSender implements EmailSender {
  readonly configured = false;
  async send(): Promise<SendResult> {
    return { ok: false, error: "Email provider not configured" };
  }
}

/** Accepts only simple addresses for Reply-To, never display names supplied by the public. */
export function safeReplyTo(address: string): string | undefined {
  return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/.test(address) ? address : undefined;
}
