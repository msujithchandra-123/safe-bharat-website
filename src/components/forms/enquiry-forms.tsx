"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { serviceOptions } from "@/content/services";
import {
  AMC_SYSTEM_TYPES,
  amcEnquirySchema,
  contactEnquirySchema,
  equipmentEnquirySchema,
  LIMITS,
  quoteEnquirySchema,
  SERVICE_VALUES,
} from "@/lib/validation/enquiry";
import { ATTACHMENT_ACCEPT_CLIENT, ATTACHMENT_MAX_BYTES_CLIENT } from "@/lib/client/attachment-limits";
import { ConsentCheckbox, FileUpload, HoneypotField, SelectField, TextareaField, TextInput } from "@/components/forms/fields";
import { FormError, FormSuccess } from "@/components/forms/form-status";
import { Turnstile } from "@/components/forms/turnstile";
import { useEnquiryForm } from "@/components/forms/use-enquiry-form";
import { buttonClasses } from "@/components/ui/primitives";

type Ctl = ReturnType<typeof useEnquiryForm>;

function ConsentText() {
  return (
    <>
      I agree that Safe Bharat may use these details to respond to my enquiry, as described in the{" "}
      <Link href="/privacy-policy" target="_blank" className="font-semibold text-navy-900 underline underline-offset-2">
        privacy notice
        <span className="sr-only"> (opens in a new tab)</span>
      </Link>
      .
    </>
  );
}

function FormFooter({ ctl, submitLabel }: { ctl: Ctl; submitLabel: string }) {
  const submitting = ctl.form.formState.isSubmitting;
  return (
    <div className="space-y-5">
      <ConsentCheckbox {...ctl.form.register("consent")} error={ctl.errorFor("consent")}>
        <ConsentText />
      </ConsentCheckbox>
      <Turnstile key={ctl.turnstileKey} onToken={ctl.setTurnstileToken} />
      {ctl.outcome?.status === "error" ? <FormError message={ctl.outcome.message} /> : null}
      <button type="submit" disabled={submitting} aria-disabled={submitting} className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
        {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
        {submitting ? "Submitting…" : submitLabel}
      </button>
      <p className="text-xs text-muted">Fields marked * are required. Submitting a form does not create a contract or a quotation.</p>
    </div>
  );
}

function FormShell({ ctl, children, label }: { ctl: Ctl; children: ReactNode; label: string }) {
  if (ctl.outcome?.status === "success") return <FormSuccess referenceNumber={ctl.outcome.referenceNumber} onReset={ctl.reset} />;
  return (
    <form onSubmit={ctl.onSubmit} noValidate aria-label={label} className="relative space-y-5" aria-busy={ctl.form.formState.isSubmitting}>
      <HoneypotField name="website" value={ctl.honeypot} onChange={(e) => ctl.setHoneypot(e.target.value)} />
      {children}
    </form>
  );
}

function ContactFields({ ctl, companyRequired }: { ctl: Ctl; companyRequired: boolean }) {
  const { register } = ctl.form;
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Full name" required autoComplete="name" maxLength={LIMITS.name} {...register("fullName")} error={ctl.errorFor("fullName")} />
        <TextInput
          label="Company name"
          required={companyRequired}
          autoComplete="organization"
          maxLength={LIMITS.company}
          {...register("companyName")}
          error={ctl.errorFor("companyName")}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Business email" required type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} {...register("email")} error={ctl.errorFor("email")} />
        <TextInput
          label="Phone number"
          required
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          maxLength={LIMITS.phone}
          {...register("phone")}
          error={ctl.errorFor("phone")}
        />
      </div>
    </>
  );
}

export function ContactForm() {
  const ctl = useEnquiryForm(contactEnquirySchema, { enquiryType: "CONTACT", fullName: "", email: "", phone: "", companyName: "", serviceRequired: "", message: "" }) as unknown as Ctl;
  return (
    <FormShell ctl={ctl} label="Contact form">
      <ContactFields ctl={ctl} companyRequired={false} />
      <SelectField
        label="Topic"
        options={[...serviceOptions, { value: "general", label: "General question" }]}
        placeholder="Select a topic"
        {...ctl.form.register("serviceRequired")}
        error={ctl.errorFor("serviceRequired")}
      />
      <TextareaField label="Message" required maxLength={LIMITS.message} {...ctl.form.register("message")} error={ctl.errorFor("message")} />
      <FormFooter ctl={ctl} submitLabel="Send message" />
    </FormShell>
  );
}

export function QuoteForm({ attachmentsEnabled, defaultService }: { attachmentsEnabled: boolean; defaultService?: string }) {
  const ctl = useEnquiryForm(quoteEnquirySchema, {
    enquiryType: "QUOTE",
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    jobRole: "",
    siteLocation: "",
    serviceRequired: defaultService ?? "",
    message: "",
    approximateScope: "",
  }) as unknown as Ctl;
  const { register } = ctl.form;

  // Pre-select the service when arriving from a service page (?service=slug). Read from the
  // URL after mount so the form is never swapped out (which would discard typed input).
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("service");
    if (requested && SERVICE_VALUES.includes(requested) && !ctl.form.getFieldState("serviceRequired").isDirty) {
      ctl.form.setValue("serviceRequired", requested);
    }
  }, [ctl.form]);

  return (
    <FormShell ctl={ctl} label="Request a quote">
      <ContactFields ctl={ctl} companyRequired />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Job role" autoComplete="organization-title" maxLength={LIMITS.role} {...register("jobRole")} error={ctl.errorFor("jobRole")} />
        <TextInput
          label="Site location"
          required
          placeholder="e.g. Autonagar, Visakhapatnam"
          maxLength={LIMITS.location}
          {...register("siteLocation")}
          error={ctl.errorFor("siteLocation")}
        />
      </div>
      <SelectField
        label="Service required"
        required
        options={[...serviceOptions, { value: "other", label: "Other / not sure yet" }]}
        {...register("serviceRequired")}
        error={ctl.errorFor("serviceRequired")}
      />
      <TextareaField
        label="Project description"
        required
        hint="Describe the site, the systems or equipment involved, and any timelines or drawings you have."
        maxLength={LIMITS.message}
        {...register("message")}
        error={ctl.errorFor("message")}
      />
      <TextInput
        label="Approximate scope or quantity"
        placeholder="e.g. 40 extinguishers, 2 floors, 3,000 m² warehouse"
        maxLength={LIMITS.shortText}
        {...register("approximateScope")}
        error={ctl.errorFor("approximateScope")}
      />
      {attachmentsEnabled ? (
        <FileUpload
          label="Attachment"
          hint="PDF, PNG or JPEG, up to 4 MB, such as drawings, a BOQ or site photos."
          accept={ATTACHMENT_ACCEPT_CLIENT}
          maxBytes={ATTACHMENT_MAX_BYTES_CLIENT}
          onChange={ctl.setAttachment}
          error={ctl.outcome?.status === "error" ? ctl.outcome.fields?.attachment : undefined}
        />
      ) : (
        <p className="rounded-md bg-mist px-4 py-3 text-sm text-body">
          Have drawings or a BOQ? Mention them in the description and our team will tell you where to send them.
        </p>
      )}
      <FormFooter ctl={ctl} submitLabel="Request quotation" />
    </FormShell>
  );
}

export function AMCForm() {
  const ctl = useEnquiryForm(amcEnquirySchema, {
    enquiryType: "AMC",
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    siteLocation: "",
    equipmentQuantity: "",
    currentMaintenance: "",
    message: "",
  } as never) as unknown as Ctl;
  const { register } = ctl.form;
  return (
    <FormShell ctl={ctl} label="Request an AMC">
      <ContactFields ctl={ctl} companyRequired />
      <TextInput label="Site location" required maxLength={LIMITS.location} {...register("siteLocation")} error={ctl.errorFor("siteLocation")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="System type"
          required
          options={AMC_SYSTEM_TYPES.map((t) => ({ value: t, label: t }))}
          {...register("systemType")}
          error={ctl.errorFor("systemType")}
        />
        <TextInput
          label="Approximate equipment quantity"
          required
          placeholder="e.g. 60 extinguishers, 120 detectors"
          maxLength={LIMITS.service}
          {...register("equipmentQuantity")}
          error={ctl.errorFor("equipmentQuantity")}
        />
      </div>
      <TextInput
        label="Current maintenance arrangement"
        placeholder="e.g. contract ending in March, no current AMC"
        maxLength={LIMITS.shortText}
        {...register("currentMaintenance")}
        error={ctl.errorFor("currentMaintenance")}
      />
      <TextareaField
        label="Required service and notes"
        required
        maxLength={LIMITS.message}
        {...register("message")}
        error={ctl.errorFor("message")}
      />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy-900">
          Preferred contact method <span className="text-brand-red" aria-hidden="true">*</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {(
            [
              ["PHONE", "Phone"],
              ["EMAIL", "Email"],
              ["WHATSAPP", "WhatsApp"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md border border-line-strong px-4 py-2.5 text-sm has-[:checked]:border-navy-900 has-[:checked]:bg-navy-50">
              <input type="radio" value={value} className="accent-navy-900" {...register("preferredContactMethod")} />
              {label}
            </label>
          ))}
        </div>
        {ctl.errorFor("preferredContactMethod") ? (
          <p className="mt-1.5 text-sm font-medium text-brand-red-dark">{ctl.errorFor("preferredContactMethod")}</p>
        ) : null}
      </fieldset>
      <FormFooter ctl={ctl} submitLabel="Request AMC proposal" />
    </FormShell>
  );
}

export function EquipmentEnquiryForm({ productSlug, productName }: { productSlug: string; productName: string }) {
  const ctl = useEnquiryForm(equipmentEnquirySchema, {
    enquiryType: "EQUIPMENT",
    productSlug,
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    siteLocation: "",
    equipmentQuantity: "",
    message: "",
  }) as unknown as Ctl;
  const { register } = ctl.form;
  return (
    <FormShell ctl={ctl} label={`Enquire about ${productName}`}>
      <input type="hidden" {...register("productSlug")} />
      <ContactFields ctl={ctl} companyRequired={false} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Quantity" maxLength={LIMITS.service} {...register("equipmentQuantity")} error={ctl.errorFor("equipmentQuantity")} />
        <TextInput label="Delivery location" maxLength={LIMITS.location} {...register("siteLocation")} error={ctl.errorFor("siteLocation")} />
      </div>
      <TextareaField
        label="Requirement details"
        required
        hint="Tell us the application, any specification or approved make list, and your timeline."
        maxLength={LIMITS.message}
        {...register("message")}
        error={ctl.errorFor("message")}
      />
      <FormFooter ctl={ctl} submitLabel="Send product enquiry" />
    </FormShell>
  );
}
