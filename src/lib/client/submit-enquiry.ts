import type { ApiResponse } from "@/lib/api/response";
import type { EnquiryPayloadInput } from "@/lib/validation/enquiry";

export interface SubmitSuccess {
  status: "success";
  referenceNumber: string;
  duplicate: boolean;
}

export interface SubmitFailure {
  status: "error";
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export type SubmitOutcome = SubmitSuccess | SubmitFailure;

export function newIdempotencyKey(): string {
  const raw = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 40).padEnd(16, "0");
}

/** Posts to the shared enquiry API used by every form and the chatbot. */
export async function postEnquiry(
  payload: EnquiryPayloadInput,
  meta: { idempotencyKey: string; turnstileToken: string | null; website?: string; source?: "WEBSITE_FORM" | "CHATBOT"; attachment?: File | null },
): Promise<SubmitOutcome> {
  const body = {
    ...payload,
    idempotencyKey: meta.idempotencyKey,
    turnstileToken: meta.turnstileToken ?? undefined,
    website: meta.website || undefined,
    source: meta.source ?? "WEBSITE_FORM",
  };

  let response: Response;
  try {
    if (meta.attachment) {
      const form = new FormData();
      form.set("payload", JSON.stringify(body));
      form.set("attachment", meta.attachment);
      response = await fetch("/api/v1/enquiries", { method: "POST", body: form });
    } else {
      response = await fetch("/api/v1/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
  } catch {
    return { status: "error", code: "NETWORK", message: "We could not reach the server. Check your connection and try again." };
  }

  let json: ApiResponse<{ referenceNumber: string; duplicate: boolean }> | null = null;
  try {
    json = (await response.json()) as ApiResponse<{ referenceNumber: string; duplicate: boolean }>;
  } catch {
    json = null;
  }
  if (json?.ok) return { status: "success", referenceNumber: json.data.referenceNumber, duplicate: json.data.duplicate };
  if (json && !json.ok) return { status: "error", code: json.error.code, message: json.error.message, fields: json.error.fields };
  return { status: "error", code: "UNKNOWN", message: "Something went wrong. Please try again, or call or email us." };
}
