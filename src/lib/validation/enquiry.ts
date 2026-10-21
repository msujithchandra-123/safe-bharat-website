import { z } from "zod";
import { equipment } from "@/content/equipment";
import { services } from "@/content/services";

/**
 * Single source of truth for enquiry validation. Used by the browser forms
 * (React Hook Form), the enquiry API and chatbot lead capture.
 */

export const ENQUIRY_TYPES = ["CONTACT", "QUOTE", "AMC", "EQUIPMENT", "CALLBACK"] as const;
export type EnquiryTypeValue = (typeof ENQUIRY_TYPES)[number];

export const CONTACT_METHODS = ["PHONE", "EMAIL", "WHATSAPP"] as const;
export type ContactMethodValue = (typeof CONTACT_METHODS)[number];

export const AMC_SYSTEM_TYPES = [
  "Fire extinguishers",
  "Fire alarm system",
  "Hydrant / hose reel system",
  "Sprinkler system",
  "Multiple systems",
  "Not sure",
] as const;

export const SERVICE_VALUES: [string, ...string[]] = ["other", ...services.map((s) => s.slug)];
const EQUIPMENT_SLUGS = new Set(equipment.map((e) => e.slug));

export const LIMITS = {
  name: 120,
  email: 254,
  phone: 20,
  company: 160,
  role: 120,
  location: 200,
  service: 120,
  message: 4000,
  shortText: 500,
} as const;

/** Removes control characters (keeping newlines/tabs) and trims. */
export function normaliseText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

const text = (max: number, label: string) =>
  z
    .string({ error: `${label} is required.` })
    .transform(normaliseText)
    .pipe(z.string().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`));

const optionalText = (max: number, label: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : normaliseText(v)))
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer.`).optional())
    .transform((v) => (v ? v : undefined));

const phone = z
  .string({ error: "Phone number is required." })
  .transform(normaliseText)
  .pipe(
    z
      .string()
      .min(1, "Phone number is required.")
      .regex(/^\+?[0-9][0-9\s-]{8,18}$/, "Enter a valid phone number, for example +91 98765 43210."),
  );

const email = z
  .string({ error: "Email is required." })
  .transform((v) => normaliseText(v).toLowerCase())
  .pipe(z.email("Enter a valid email address.").max(LIMITS.email));

const consent = z.literal(true, { error: "Please confirm you have read the privacy notice." });

const baseFields = {
  fullName: text(LIMITS.name, "Full name"),
  email,
  phone,
  consent,
};

export const contactEnquirySchema = z.object({
  enquiryType: z.literal("CONTACT"),
  ...baseFields,
  companyName: optionalText(LIMITS.company, "Company name"),
  serviceRequired: optionalText(LIMITS.service, "Topic"),
  message: text(LIMITS.message, "Message"),
});

export const quoteEnquirySchema = z.object({
  enquiryType: z.literal("QUOTE"),
  ...baseFields,
  companyName: text(LIMITS.company, "Company name"),
  jobRole: optionalText(LIMITS.role, "Job role"),
  siteLocation: text(LIMITS.location, "Site location"),
  serviceRequired: z.enum(SERVICE_VALUES, { error: "Select the service you need." }),
  message: text(LIMITS.message, "Project description"),
  approximateScope: optionalText(LIMITS.shortText, "Approximate scope"),
});

export const amcEnquirySchema = z.object({
  enquiryType: z.literal("AMC"),
  ...baseFields,
  companyName: text(LIMITS.company, "Company name"),
  siteLocation: text(LIMITS.location, "Site location"),
  systemType: z.enum(AMC_SYSTEM_TYPES, { error: "Select the system type." }),
  equipmentQuantity: text(LIMITS.service, "Approximate equipment quantity"),
  currentMaintenance: optionalText(LIMITS.shortText, "Current maintenance arrangement"),
  message: text(LIMITS.message, "Required service and notes"),
  preferredContactMethod: z.enum(CONTACT_METHODS, { error: "Select a preferred contact method." }),
});

export const equipmentEnquirySchema = z.object({
  enquiryType: z.literal("EQUIPMENT"),
  ...baseFields,
  companyName: optionalText(LIMITS.company, "Company name"),
  siteLocation: optionalText(LIMITS.location, "Delivery location"),
  productSlug: z.string().refine((slug) => EQUIPMENT_SLUGS.has(slug), "Unknown product."),
  equipmentQuantity: optionalText(LIMITS.service, "Quantity"),
  message: text(LIMITS.message, "Requirement details"),
});

export const callbackEnquirySchema = z.object({
  enquiryType: z.literal("CALLBACK"),
  ...baseFields,
  companyName: optionalText(LIMITS.company, "Company name"),
  message: text(LIMITS.message, "What would you like to discuss"),
  preferredContactMethod: z.enum(CONTACT_METHODS).optional(),
});

export const enquiryPayloadSchema = z.discriminatedUnion("enquiryType", [
  contactEnquirySchema,
  quoteEnquirySchema,
  amcEnquirySchema,
  equipmentEnquirySchema,
  callbackEnquirySchema,
]);

export type EnquiryPayload = z.output<typeof enquiryPayloadSchema>;
export type EnquiryPayloadInput = z.input<typeof enquiryPayloadSchema>;

/** Transport envelope fields validated alongside every enquiry. */
export const enquiryEnvelopeSchema = z.object({
  idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/, "Invalid submission key."),
  turnstileToken: z.string().max(4096).optional(),
  source: z.enum(["WEBSITE_FORM", "CHATBOT"]).default("WEBSITE_FORM"),
  // Honeypot: real users never see or fill this field.
  website: z.string().max(200).optional(),
});

export type EnquiryEnvelope = z.output<typeof enquiryEnvelopeSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const ENQUIRY_TYPE_LABELS: Record<EnquiryTypeValue, string> = {
  CONTACT: "General enquiry",
  QUOTE: "Quotation request",
  AMC: "AMC request",
  EQUIPMENT: "Equipment enquiry",
  CALLBACK: "Callback request",
};
