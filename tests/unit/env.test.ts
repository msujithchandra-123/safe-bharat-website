import { afterEach, describe, expect, it } from "vitest";
import { serverEnv } from "@/lib/env";

const KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "EMAIL_FROM",
  "CONTACT_FROM_EMAIL",
  "ENQUIRY_NOTIFICATION_TO",
  "CONTACT_NOTIFICATION_EMAIL",
] as const;
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
  it("is configured with the primary variable names and accepts a Gmail sender", () => {
    set({
      SMTP_USER: "safebharatsales@gmail.com",
      SMTP_PASSWORD: "abcdefghijklmnop",
      EMAIL_FROM: "Safe Bharat <safebharatsales@gmail.com>",
      ENQUIRY_NOTIFICATION_TO: "safebharatsales@gmail.com",
    });
    expect(serverEnv.email()).toMatchObject({ configured: true, from: "Safe Bharat <safebharatsales@gmail.com>", to: ["safebharatsales@gmail.com"] });
  });

  it("defaults to Gmail over implicit TLS and sends from the SMTP mailbox", () => {
    set({ SMTP_USER: "safebharatsales@gmail.com", SMTP_PASSWORD: "abcdefghijklmnop", ENQUIRY_NOTIFICATION_TO: "x@example.in" });
    expect(serverEnv.email()).toMatchObject({ configured: true, host: "smtp.gmail.com", port: 465, from: "Safe Bharat <safebharatsales@gmail.com>" });
  });

  it("uses a custom host and port", () => {
    set({ SMTP_HOST: "smtp.example.in", SMTP_PORT: "587", SMTP_USER: "u@example.in", SMTP_PASSWORD: "secret", ENQUIRY_NOTIFICATION_TO: "x@example.in" });
    expect(serverEnv.email()).toMatchObject({ configured: true, host: "smtp.example.in", port: 587 });
  });

  it("removes the spaces Google shows inside an App Password", () => {
    set({ SMTP_USER: "u@gmail.com", SMTP_PASSWORD: "abcd efgh ijkl mnop", ENQUIRY_NOTIFICATION_TO: "x@example.in" });
    expect(serverEnv.email().password).toBe("abcdefghijklmnop");
  });

  it("accepts CONTACT_FROM_EMAIL and CONTACT_NOTIFICATION_EMAIL as aliases", () => {
    set({
      SMTP_USER: "u@example.in",
      SMTP_PASSWORD: "secret",
      CONTACT_FROM_EMAIL: "Safe Bharat <enquiries@example.in>",
      CONTACT_NOTIFICATION_EMAIL: "a@example.in, b@example.in",
    });
    expect(serverEnv.email()).toMatchObject({ configured: true, from: "Safe Bharat <enquiries@example.in>", to: ["a@example.in", "b@example.in"] });
  });

  it("is not configured without an SMTP password", () => {
    set({ SMTP_USER: "u@example.in", ENQUIRY_NOTIFICATION_TO: "x@example.in" });
    expect(serverEnv.email().configured).toBe(false);
  });

  it("is not configured with an invalid port", () => {
    set({ SMTP_PORT: "abc", SMTP_USER: "u@example.in", SMTP_PASSWORD: "secret", ENQUIRY_NOTIFICATION_TO: "x@example.in" });
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
