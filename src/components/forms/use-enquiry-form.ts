"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { newIdempotencyKey, postEnquiry, type SubmitOutcome } from "@/lib/client/submit-enquiry";
import type { EnquiryPayloadInput } from "@/lib/validation/enquiry";
import { TURNSTILE_SITE_KEY } from "@/components/forms/turnstile";

/**
 * Shared behaviour for every enquiry form: client validation with the same
 * Zod schema the server uses, Turnstile token handling, an idempotency key
 * per submission attempt, and mapping of server field errors.
 */
export function useEnquiryForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  defaultValues: DefaultValues<z.input<TSchema>>,
  options: { source?: "WEBSITE_FORM" | "CHATBOT" } = {},
) {
  const form = useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    resolver: zodResolver(schema as never) as never,
    defaultValues,
    mode: "onTouched",
  });
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  /** Changing this key remounts the Turnstile widget, which issues a fresh single-use token. */
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const idempotencyKey = useRef<string>("");

  // Do not show a stale error message when a preserved route becomes visible again.
  useLayoutEffect(() => () => setOutcome((o) => (o?.status === "error" ? null : o)), []);

  const refreshTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileKey((k) => k + 1);
  };

  const submitValues = async (values: z.output<TSchema>) => {
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setOutcome({ status: "error", code: "SPAM_CHECK_FAILED", message: "Please complete the security check before submitting." });
      return;
    }
    idempotencyKey.current ||= newIdempotencyKey();
    const result = await postEnquiry(values as EnquiryPayloadInput, {
      idempotencyKey: idempotencyKey.current,
      turnstileToken,
      website: honeypot,
      source: options.source,
      attachment,
    });
    setOutcome(result);
    if (result.status === "success") {
      idempotencyKey.current = "";
      return;
    }
    refreshTurnstile();
    if (result.fields) {
      for (const [field, message] of Object.entries(result.fields)) {
        if (field === "form") continue;
        form.setError(field as Path<z.input<TSchema>>, { type: "server", message });
      }
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => form.handleSubmit(submitValues)(event);

  const reset = () => {
    form.reset(defaultValues);
    setOutcome(null);
    setAttachment(null);
    idempotencyKey.current = "";
    refreshTurnstile();
  };

  const errors = form.formState.errors as Record<string, { message?: unknown } | undefined>;

  return {
    form,
    onSubmit,
    outcome,
    reset,
    turnstileKey,
    setTurnstileToken,
    setAttachment,
    honeypot,
    setHoneypot,
    errorFor: (name: string) => {
      const message = errors[name]?.message;
      return typeof message === "string" ? message : undefined;
    },
  };
}
