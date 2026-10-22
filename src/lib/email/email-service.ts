import nodemailer from "nodemailer";
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

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

/** The part of a nodemailer transporter this sender uses; tests inject a fake. */
export interface MailTransport {
  sendMail(message: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
    messageId: string;
  }): Promise<{ messageId?: string }>;
}

/** Sends through an authenticated SMTP mailbox (Gmail by default); the customer's address is only ever used as Reply-To. */
export class SmtpEmailSender implements EmailSender {
  readonly configured = true;
  private readonly transport: MailTransport;
  private readonly from: string;

  constructor(
    config: SmtpConfig,
    /** A slow server must not hold the visitor's request open; the retry job resends later. */
    private readonly timeoutMs = 10_000,
    transport?: MailTransport,
  ) {
    this.from = config.from;
    this.transport =
      transport ??
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        // Port 465 uses implicit TLS; 587 upgrades with STARTTLS.
        secure: config.port === 465,
        auth: { user: config.user, pass: config.password },
        connectionTimeout: timeoutMs,
        greetingTimeout: timeoutMs,
        socketTimeout: timeoutMs,
      });
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
      // SMTP has no server-side idempotency. A fixed Message-ID per notification is the closest
      // equivalent: mail clients treat a retried copy as the same message instead of a new thread.
      const info = await this.transport.sendMail({
        from: this.from,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { replyTo: email.replyTo } : {}),
        messageId: `<${email.idempotencyKey}@safebharat.local>`,
      });
      return { ok: true, providerId: info.messageId ?? null };
    } catch (error) {
      if (!(error instanceof Error)) return { ok: false, error: "UnknownError" };
      const code = (error as Error & { code?: unknown }).code;
      return { ok: false, error: `${typeof code === "string" ? code : error.name}: ${error.message}`.slice(0, 480) };
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
