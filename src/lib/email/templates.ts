import { siteConfig, formatAddress } from "@/config/site";
import { getEquipmentItem } from "@/content/equipment";
import { getService } from "@/content/services";
import { ENQUIRY_TYPE_LABELS, type EnquiryTypeValue } from "@/lib/validation/enquiry";

/** Fields of a stored enquiry that templates may display. */
export interface EnquiryEmailData {
  referenceNumber: string;
  enquiryType: EnquiryTypeValue;
  source: "WEBSITE_FORM" | "CHATBOT";
  fullName: string;
  email: string;
  phone: string;
  companyName: string | null;
  jobRole: string | null;
  siteLocation: string | null;
  serviceRequired: string | null;
  message: string;
  approximateScope: string | null;
  systemType: string | null;
  equipmentQuantity: string | null;
  currentMaintenance: string | null;
  preferredContactMethod: string | null;
  productSlug: string | null;
  attachmentCount: number;
  createdAt: Date;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Subject lines must not contain line breaks (header injection). */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 120);
}

const NAVY = "#071B3B";
const RED = "#D71920";

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="en"><body style="margin:0;background:#F2F4F7;font-family:Arial,Helvetica,sans-serif;color:#101828">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F7;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #E4E7EC">
<tr><td style="background:${NAVY};padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold">Safe <span style="color:#ffffff">Bharat</span><div style="font-size:12px;font-weight:normal;letter-spacing:1px;color:#C7D2E4">FIRE AND SAFETY SOLUTIONS</div></td></tr>
<tr><td style="height:4px;background:${RED}"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;color:${NAVY}">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px;background:#F9FAFB;color:#667085;font-size:12px">${escapeHtml(siteConfig.name)} · ${escapeHtml(formatAddress())}</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(data: EnquiryEmailData): [string, string][] {
  const r: [string, string | null][] = [
    ["Reference", data.referenceNumber],
    ["Type", ENQUIRY_TYPE_LABELS[data.enquiryType]],
    ["Source", data.source === "CHATBOT" ? "Website AI assistant (lead capture)" : "Website form"],
    ["Name", data.fullName],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Company", data.companyName],
    ["Job role", data.jobRole],
    ["Site location", data.siteLocation],
    ["Service required", data.serviceRequired ? (getService(data.serviceRequired)?.title ?? (data.serviceRequired === "other" ? "Other / not sure yet" : data.serviceRequired)) : null],
    ["Product", data.productSlug ? (getEquipmentItem(data.productSlug)?.name ?? data.productSlug) : null],
    ["System type", data.systemType],
    ["Equipment quantity", data.equipmentQuantity],
    ["Approximate scope", data.approximateScope],
    ["Current maintenance", data.currentMaintenance],
    ["Preferred contact", data.preferredContactMethod],
    ["Attachments", data.attachmentCount > 0 ? `${data.attachmentCount} file(s) stored in the private attachments bucket` : null],
    ["Received", data.createdAt.toISOString()],
  ];
  return r.filter((row): row is [string, string] => Boolean(row[1]));
}

function subjectFor(data: EnquiryEmailData): string {
  const label = data.source === "CHATBOT" ? `Chatbot lead: ${ENQUIRY_TYPE_LABELS[data.enquiryType]}` : `New ${ENQUIRY_TYPE_LABELS[data.enquiryType].toLowerCase()}`;
  const who = data.companyName ?? data.fullName;
  return headerSafe(`[${data.referenceNumber}] ${label} from ${who}`);
}

/** Internal notification to the business inbox. Covers every enquiry type. */
export function renderNotificationEmail(data: EnquiryEmailData): RenderedEmail {
  const table = rows(data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#667085;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;font-size:14px">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const message = `<div style="margin-top:20px;padding:16px;background:#F2F4F7;border-radius:6px;font-size:14px;line-height:1.5;white-space:pre-wrap">${escapeHtml(data.message)}</div>`;
  const note =
    data.source === "CHATBOT"
      ? `<p style="font-size:12px;color:#667085;margin-top:16px">The customer confirmed these details in the website assistant and gave consent before submitting. No conversation transcript is stored.</p>`
      : "";
  const html = layout(subjectFor(data).replace(/^\[[^\]]+\]\s*/, ""), `<table role="presentation" cellpadding="0" cellspacing="0">${table}</table>${message}${note}`);
  const text = [...rows(data).map(([k, v]) => `${k}: ${v}`), "", "Message:", data.message].join("\n");
  return { subject: subjectFor(data), html, text };
}

/** Acknowledgement to the customer. Contains no promise of price, timing or outcome. */
export function renderAcknowledgementEmail(data: Pick<EnquiryEmailData, "referenceNumber" | "fullName" | "enquiryType">): RenderedEmail {
  const type = ENQUIRY_TYPE_LABELS[data.enquiryType].toLowerCase();
  const phones = siteConfig.contact.phones.map((p) => p.display).join(" / ");
  const html = layout(
    "We have received your enquiry",
    `<p style="font-size:14px;line-height:1.6">Dear ${escapeHtml(data.fullName)},</p>
<p style="font-size:14px;line-height:1.6">Thank you for contacting Safe Bharat. We have received your ${escapeHtml(type)}. Your reference number is <strong>${escapeHtml(data.referenceNumber)}</strong>.</p>
<p style="font-size:14px;line-height:1.6">Our team will review your requirement and contact you using the details you provided. If anything is urgent, call us on ${escapeHtml(phones)}.</p>
<p style="font-size:13px;line-height:1.6;color:#667085">This is an automated acknowledgement, not a quotation. In a fire emergency, call 112.</p>`,
  );
  const text = `Dear ${data.fullName},\n\nThank you for contacting Safe Bharat. We have received your ${type}. Your reference number is ${data.referenceNumber}.\n\nOur team will review your requirement and contact you using the details you provided. If anything is urgent, call us on ${phones}.\n\nThis is an automated acknowledgement, not a quotation. In a fire emergency, call 112.`;
  return { subject: headerSafe(`We have received your enquiry (${data.referenceNumber})`), html, text };
}
