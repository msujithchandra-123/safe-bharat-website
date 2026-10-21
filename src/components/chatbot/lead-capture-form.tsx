"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getService, serviceOptions } from "@/content/services";
import { newIdempotencyKey, postEnquiry } from "@/lib/client/submit-enquiry";
import {
  AMC_SYSTEM_TYPES,
  amcEnquirySchema,
  callbackEnquirySchema,
  fieldErrors,
  LIMITS,
  quoteEnquirySchema,
  type EnquiryPayloadInput,
} from "@/lib/validation/enquiry";
import { TURNSTILE_SITE_KEY, Turnstile, type TurnstileHandle } from "@/components/forms/turnstile";
import { cn } from "@/components/ui/primitives";
import type { LeadType } from "@/components/chatbot/chat-types";

type Values = Record<string, string>;

const TITLES: Record<LeadType, string> = { QUOTE: "Quotation request", AMC: "AMC request", CALLBACK: "Callback request" };

function buildPayload(type: LeadType, v: Values, consent: boolean): EnquiryPayloadInput {
  const base = { fullName: v.fullName ?? "", email: v.email ?? "", phone: v.phone ?? "", consent: consent as true };
  if (type === "QUOTE") {
    return {
      enquiryType: "QUOTE",
      ...base,
      companyName: v.companyName ?? "",
      siteLocation: v.siteLocation ?? "",
      serviceRequired: v.serviceRequired ?? "",
      message: v.message ?? "",
    };
  }
  if (type === "AMC") {
    return {
      enquiryType: "AMC",
      ...base,
      companyName: v.companyName ?? "",
      siteLocation: v.siteLocation ?? "",
      systemType: (v.systemType ?? "") as (typeof AMC_SYSTEM_TYPES)[number],
      equipmentQuantity: v.equipmentQuantity ?? "",
      message: v.message ?? "",
      preferredContactMethod: (v.preferredContactMethod || "PHONE") as "PHONE",
    };
  }
  return { enquiryType: "CALLBACK", ...base, companyName: v.companyName || undefined, message: v.message ?? "", preferredContactMethod: "PHONE" };
}

const schemas = { QUOTE: quoteEnquirySchema, AMC: amcEnquirySchema, CALLBACK: callbackEnquirySchema };

function Field({
  label,
  name,
  values,
  errors,
  onChange,
  type = "text",
  required = true,
  maxLength,
  textarea,
  autoComplete,
}: {
  label: string;
  name: string;
  values: Values;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  type?: string;
  required?: boolean;
  maxLength: number;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const id = `lead-${name}`;
  const err = errors[name];
  const cls = cn(
    "mt-1 block w-full rounded-md border bg-white px-3 text-sm focus:border-navy-700 focus:outline-2 focus:outline-navy-700/25",
    err ? "border-brand-red" : "border-line-strong",
    textarea ? "min-h-20 py-2" : "h-10",
  );
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-navy-900">
        {label}
        {required ? <span className="text-brand-red"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {textarea ? (
        <textarea id={id} value={values[name] ?? ""} maxLength={maxLength} onChange={(e) => onChange(name, e.target.value)} aria-invalid={err ? true : undefined} aria-describedby={err ? `${id}-e` : undefined} className={cls} />
      ) : (
        <input
          id={id}
          type={type}
          value={values[name] ?? ""}
          maxLength={maxLength}
          autoComplete={autoComplete}
          onChange={(e) => onChange(name, e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-e` : undefined}
          className={cls}
        />
      )}
      {err ? (
        <p id={`${id}-e`} className="mt-1 text-xs font-medium text-brand-red-dark">
          {err}
        </p>
      ) : null}
    </div>
  );
}

export function LeadCaptureForm({
  leadType,
  service,
  prefill,
  onSubmitted,
  onCancel,
}: {
  leadType: LeadType;
  service?: string | null;
  prefill?: string;
  onSubmitted: (referenceNumber: string, leadType: LeadType) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Values>({
    serviceRequired: service && getService(service) ? service : "",
    message: prefill?.slice(0, LIMITS.message) ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"details" | "review">("details");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const key = useRef(newIdempotencyKey());
  const turnstile = useRef<TurnstileHandle>(null);

  const onChange = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[name];
      return next;
    });
  };

  const review = () => {
    const parsed = schemas[leadType].safeParse(buildPayload(leadType, values, true));
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setStep("review");
  };

  const submit = async () => {
    if (!consent) {
      setSubmitError("Please confirm the privacy notice to continue.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !token) {
      setSubmitError("Please complete the security check.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const result = await postEnquiry(buildPayload(leadType, values, consent), { idempotencyKey: key.current, turnstileToken: token, source: "CHATBOT" });
    setSubmitting(false);
    if (result.status === "success") {
      onSubmitted(result.referenceNumber, leadType);
      return;
    }
    turnstile.current?.reset();
    if (result.fields && Object.keys(result.fields).some((k) => k !== "form")) {
      setErrors(result.fields);
      setStep("details");
    }
    setSubmitError(result.message);
  };

  const summary: [string, string | undefined][] = [
    ["Name", values.fullName],
    ["Email", values.email],
    ["Phone", values.phone],
    ["Company", values.companyName],
    ["Site location", values.siteLocation],
    ["Service", leadType === "QUOTE" ? serviceOptions.find((o) => o.value === values.serviceRequired)?.label ?? "Other / not sure" : undefined],
    ["System type", leadType === "AMC" ? values.systemType : undefined],
    ["Equipment quantity", leadType === "AMC" ? values.equipmentQuantity : undefined],
    ["Contact by", leadType === "AMC" ? ({ PHONE: "Phone", EMAIL: "Email", WHATSAPP: "WhatsApp" } as Record<string, string>)[values.preferredContactMethod ?? "PHONE"] : undefined],
    ["Details", values.message],
  ];

  return (
    <div className="w-full rounded-xl border border-line bg-white p-4" role="group" aria-label={TITLES[leadType]}>
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm font-bold text-navy-900">{TITLES[leadType]}</p>
        <p className="text-xs text-muted">Step {step === "details" ? 1 : 2} of 2</p>
      </div>

      {step === "details" ? (
        <div className="mt-3 space-y-3">
          <Field label="Full name" name="fullName" values={values} errors={errors} onChange={onChange} maxLength={LIMITS.name} autoComplete="name" />
          <Field label="Email" name="email" type="email" values={values} errors={errors} onChange={onChange} maxLength={LIMITS.email} autoComplete="email" />
          <Field label="Phone" name="phone" type="tel" values={values} errors={errors} onChange={onChange} maxLength={LIMITS.phone} autoComplete="tel" />
          <Field label="Company" name="companyName" required={leadType !== "CALLBACK"} values={values} errors={errors} onChange={onChange} maxLength={LIMITS.company} autoComplete="organization" />
          {leadType !== "CALLBACK" ? <Field label="Site location" name="siteLocation" values={values} errors={errors} onChange={onChange} maxLength={LIMITS.location} /> : null}
          {leadType === "QUOTE" ? (
            <div>
              <label htmlFor="lead-serviceRequired" className="text-xs font-semibold text-navy-900">
                Service <span className="text-brand-red">*</span>
              </label>
              <select
                id="lead-serviceRequired"
                value={values.serviceRequired ?? ""}
                onChange={(e) => onChange("serviceRequired", e.target.value)}
                aria-invalid={errors.serviceRequired ? true : undefined}
                className="mt-1 block h-10 w-full rounded-md border border-line-strong bg-white px-2 text-sm"
              >
                <option value="">Select a service</option>
                {serviceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
                <option value="other">Other / not sure yet</option>
              </select>
              {errors.serviceRequired ? <p className="mt-1 text-xs font-medium text-brand-red-dark">{errors.serviceRequired}</p> : null}
            </div>
          ) : null}
          {leadType === "AMC" ? (
            <>
              <div>
                <label htmlFor="lead-systemType" className="text-xs font-semibold text-navy-900">
                  System type <span className="text-brand-red">*</span>
                </label>
                <select
                  id="lead-systemType"
                  value={values.systemType ?? ""}
                  onChange={(e) => onChange("systemType", e.target.value)}
                  aria-invalid={errors.systemType ? true : undefined}
                  className="mt-1 block h-10 w-full rounded-md border border-line-strong bg-white px-2 text-sm"
                >
                  <option value="">Select a system type</option>
                  {AMC_SYSTEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.systemType ? <p className="mt-1 text-xs font-medium text-brand-red-dark">{errors.systemType}</p> : null}
              </div>
              <Field label="Approximate equipment quantity" name="equipmentQuantity" values={values} errors={errors} onChange={onChange} maxLength={LIMITS.service} />
              <div>
                <label htmlFor="lead-preferredContactMethod" className="text-xs font-semibold text-navy-900">
                  Preferred contact method <span className="text-brand-red">*</span>
                </label>
                <select
                  id="lead-preferredContactMethod"
                  value={values.preferredContactMethod ?? "PHONE"}
                  onChange={(e) => onChange("preferredContactMethod", e.target.value)}
                  className="mt-1 block h-10 w-full rounded-md border border-line-strong bg-white px-2 text-sm"
                >
                  <option value="PHONE">Phone</option>
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
            </>
          ) : null}
          <Field
            label={leadType === "CALLBACK" ? "What would you like to discuss?" : "Requirement details"}
            name="message"
            textarea
            values={values}
            errors={errors}
            onChange={onChange}
            maxLength={LIMITS.message}
          />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={review} className="flex-1 rounded-md bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark">
              Review details
            </button>
            <button type="button" onClick={onCancel} className="rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-mist">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-body">Please check your details before submitting.</p>
          <dl className="space-y-1.5 rounded-lg bg-mist p-3 text-sm">
            {summary
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="grid grid-cols-[7rem_1fr] gap-2">
                  <dt className="text-muted">{k}</dt>
                  <dd className="wrap-break-word text-ink">{v}</dd>
                </div>
              ))}
          </dl>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-body">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-navy-900" />
            <span>
              I agree that Safe Bharat may use these details to respond to my request, as described in the{" "}
              <Link href="/privacy-policy" target="_blank" className="font-semibold underline">
                privacy notice
              </Link>
              .
            </span>
          </label>
          <Turnstile ref={turnstile} onToken={setToken} size="flexible" />
          {submitError ? (
            <p role="alert" className="rounded-md bg-brand-red-50 p-2.5 text-sm text-ink">
              {submitError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-60"
            >
              {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
              {submitting ? "Submitting…" : "Submit request"}
            </button>
            <button type="button" onClick={() => setStep("details")} disabled={submitting} className="rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-mist">
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
