// @vitest-environment node
// Server-side code: runs in Node, as in production.
import { describe, expect, it } from "vitest";
import { SmtpEmailSender, type MailTransport, type OutgoingEmail, type SmtpConfig } from "@/lib/email/email-service";

const config: SmtpConfig = { host: "smtp.gmail.com", port: 465, user: "safebharatsales@gmail.com", password: "secret", from: "Safe Bharat <safebharatsales@gmail.com>" };

const email: OutgoingEmail = {
  to: ["safebharatsales@gmail.com"],
  subject: "[SB-261022-ABCDE] New general enquiry from Ravi",
  html: "<p>Hello</p>",
  text: "Hello",
  replyTo: "ravi@example.in",
  idempotencyKey: "notify-123",
};

/** Fake transport: records messages, returns a canned result or throws. No network access. */
class FakeTransport implements MailTransport {
  sent: Parameters<MailTransport["sendMail"]>[0][] = [];
  constructor(private readonly behaviour: "ok" | "error" | "hang" = "ok") {}
  async sendMail(message: Parameters<MailTransport["sendMail"]>[0]) {
    this.sent.push(message);
    if (this.behaviour === "error") {
      throw Object.assign(new Error("Invalid login: 535-5.7.8 Username and Password not accepted"), { code: "EAUTH" });
    }
    if (this.behaviour === "hang") return new Promise<never>(() => {});
    return { messageId: message.messageId };
  }
}

describe("SmtpEmailSender", () => {
  it("sends from the configured mailbox with the customer as Reply-To and a stable Message-ID", async () => {
    const transport = new FakeTransport();
    const result = await new SmtpEmailSender(config, 1_000, transport).send(email);
    expect(result).toEqual({ ok: true, providerId: "<notify-123@safebharat.local>" });
    expect(transport.sent[0]).toMatchObject({
      from: "Safe Bharat <safebharatsales@gmail.com>",
      to: ["safebharatsales@gmail.com"],
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: "ravi@example.in",
      messageId: "<notify-123@safebharat.local>",
    });
  });

  it("omits Reply-To when none is given", async () => {
    const transport = new FakeTransport();
    await new SmtpEmailSender(config, 1_000, transport).send({ ...email, replyTo: undefined });
    expect(transport.sent[0]).not.toHaveProperty("replyTo");
  });

  it("reports an SMTP error with its code instead of throwing", async () => {
    const result = await new SmtpEmailSender(config, 1_000, new FakeTransport("error")).send(email);
    expect(result).toEqual({ ok: false, error: "EAUTH: Invalid login: 535-5.7.8 Username and Password not accepted" });
  });

  it("gives up after the timeout so the visitor's request is not held open", async () => {
    const result = await new SmtpEmailSender(config, 20, new FakeTransport("hang")).send(email);
    expect(result).toEqual({ ok: false, error: "Timeout after 20ms" });
  });
});
