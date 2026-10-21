import { afterEach, describe, expect, it } from "vitest";
import { serverEnv } from "@/lib/env";

const KEYS = ["RESEND_API_KEY", "EMAIL_FROM", "CONTACT_FROM_EMAIL", "ENQUIRY_NOTIFICATION_TO", "CONTACT_NOTIFICATION_EMAIL"] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function set(values: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, values);
}

describe("email configuration", () => {
  it("is configured with the primary variable names", () => {
    set({ RESEND_API_KEY: "re_test", EMAIL_FROM: "Safe Bharat <enquiries@example.in>", ENQUIRY_NOTIFICATION_TO: "safebharatsales@gmail.com" });
    expect(serverEnv.email()).toMatchObject({ configured: true, to: ["safebharatsales@gmail.com"] });
  });

  it("accepts CONTACT_FROM_EMAIL and CONTACT_NOTIFICATION_EMAIL as aliases", () => {
    set({ RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "Safe Bharat <enquiries@example.in>", CONTACT_NOTIFICATION_EMAIL: "a@example.in, b@example.in" });
    expect(serverEnv.email()).toMatchObject({ configured: true, from: "Safe Bharat <enquiries@example.in>", to: ["a@example.in", "b@example.in"] });
  });

  it("refuses a free-mail sender, which Resend can never verify", () => {
    set({ RESEND_API_KEY: "re_test", EMAIL_FROM: "Safe Bharat <safebharatsales@gmail.com>", ENQUIRY_NOTIFICATION_TO: "safebharatsales@gmail.com" });
    expect(serverEnv.email()).toMatchObject({ configured: false, senderUnverifiable: true });
  });

  it("is not configured without an API key", () => {
    set({ EMAIL_FROM: "enquiries@example.in", ENQUIRY_NOTIFICATION_TO: "x@example.in" });
    expect(serverEnv.email().configured).toBe(false);
  });
});

describe("EMAIL_AUTO_RETRY", () => {
  const original = process.env.EMAIL_AUTO_RETRY;
  afterEach(() => {
    if (original === undefined) delete process.env.EMAIL_AUTO_RETRY;
    else process.env.EMAIL_AUTO_RETRY = original;
  });

  it("is enabled by default when not configured", () => {
    delete process.env.EMAIL_AUTO_RETRY;
    expect(serverEnv.emailAutoRetry()).toBe(true);
  });

  it.each(["false", "FALSE", " false "])("is paused when set to %j", (value) => {
    process.env.EMAIL_AUTO_RETRY = value;
    expect(serverEnv.emailAutoRetry()).toBe(false);
  });

  it.each(["true", "", "yes"])("stays enabled for %j", (value) => {
    process.env.EMAIL_AUTO_RETRY = value;
    expect(serverEnv.emailAutoRetry()).toBe(true);
  });
});
