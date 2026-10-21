import { siteConfig } from "@/config/site";

/**
 * Policy text describes what this website actually does with data, as
 * implemented in the code. It has not been reviewed by a lawyer; have it
 * reviewed before launch (docs/CONTENT_REVIEW.md). Retention periods are
 * configured with ENQUIRY_RETENTION_DAYS.
 */
export const RETENTION_DAYS_DEFAULT = 730;

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export const privacyPolicy = {
  lastUpdated: "15 October 2026",
  version: siteConfig.privacyNoticeVersion,
  /** `aiProvider` is the company that processes assistant messages, e.g. "Google (Gemini API)". */
  sections: (retentionDays: number, aiProvider: string): PolicySection[] => [
    {
      heading: "Who we are",
      paragraphs: [
        `This website is operated by ${siteConfig.name}, ${siteConfig.contact.address.lines.join(", ")}, ${siteConfig.contact.address.locality}, ${siteConfig.contact.address.region} ${siteConfig.contact.address.postalCode} ("Safe Bharat", "we"). For any question about this notice or your personal data, email ${siteConfig.contact.email}.`,
      ],
    },
    {
      heading: "Information we collect",
      items: [
        "Enquiry details you submit through our forms or the website assistant: name, email address, phone number, company, job role, site location, the service or product you are interested in, your message and, where offered, an attachment you choose to upload.",
        "Your consent to this notice, with the date and the version of the notice you accepted.",
        "Messages you type into the website assistant. These are sent to our AI provider to generate a reply and are not stored in our database.",
        "Limited technical data needed to protect the website: a one-way hash of your IP address, used for rate limiting, and the result of a spam check performed by Cloudflare Turnstile.",
      ],
    },
    {
      heading: "How we use it",
      items: [
        "To respond to your enquiry, prepare proposals and quotations, and provide the services you request.",
        "To send you an acknowledgement of your enquiry and follow-up communication about it.",
        "To protect the website and our systems against spam and abuse.",
      ],
      paragraphs: ["We do not sell your personal data, and we do not use it for third-party advertising."],
    },
    {
      heading: "Service providers",
      paragraphs: [
        `We use trusted service providers to operate this website. They process data on our behalf: website hosting and database hosting; Resend for sending email; Cloudflare Turnstile for spam protection; ${aiProvider} for the AI assistant; and, where attachments are enabled, a private cloud storage bucket. Some of these providers may process data outside India.`,
      ],
    },
    {
      heading: "AI assistant",
      items: [
        "The website assistant is an AI system. Its answers may be incomplete or wrong; confirm important information with our team.",
        "Please do not share sensitive personal information in the chat.",
        "Conversation text is not saved to our database. Only operational metadata such as response time and error codes is logged.",
        "If you submit an enquiry through the assistant, only the details shown in the enquiry form you confirm are saved, in the same way as our website forms.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        `Enquiry records and their attachments are kept for up to ${Math.round(retentionDays / 30)} months after they are received, unless we need them for longer for an ongoing contract or a legal obligation. Rate-limiting records expire automatically within 24 hours.`,
      ],
    },
    {
      heading: "Your choices and rights",
      paragraphs: [
        `You can ask us to access, correct or delete the personal data we hold about you, or withdraw your consent for future processing, by emailing ${siteConfig.contact.email}. We will respond within a reasonable time and in line with applicable law.`,
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "We use encrypted connections, restricted access to stored enquiries, private storage for attachments and server-side validation of every submission. No method of transmission or storage is completely secure, but we take reasonable steps to protect your data.",
      ],
    },
    {
      heading: "Changes to this notice",
      paragraphs: ["We may update this notice. The date at the top shows when it last changed."],
    },
  ],
};

export const termsOfUse = {
  lastUpdated: "15 October 2026",
  sections: [
    {
      heading: "About these terms",
      paragraphs: [`These terms govern your use of the ${siteConfig.name} website. By using the website you agree to them.`],
    },
    {
      heading: "Information on this website",
      items: [
        "Content on this website is general information about our services and about fire safety. It is not professional advice for any specific site, and it does not replace the applicable codes, manufacturer instructions or the requirements of the fire authority.",
        "Product descriptions are indicative. Makes, specifications, availability and prices are confirmed only in a written quotation.",
        "Submitting an enquiry does not create a contract. Any work is governed by the written proposal or contract we agree with you.",
      ],
    },
    {
      heading: "Not an emergency service",
      paragraphs: [`This website, its forms and its AI assistant are not monitored for emergencies. In a fire or other emergency, call ${siteConfig.emergencyNumber}.`],
    },
    {
      heading: "AI assistant",
      paragraphs: [
        "The assistant provides automated, general information and may make mistakes. It cannot issue quotations, accept orders or make commitments on our behalf.",
      ],
    },
    {
      heading: "Acceptable use",
      items: [
        "Do not misuse the website, submit false or unlawful information, attempt to gain unauthorised access, or interfere with its operation.",
        "Do not upload files that contain malware or content you do not have the right to share.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: ["The Safe Bharat name, logo and website content belong to Safe Bharat or its licensors and may not be used without permission."],
    },
    {
      heading: "Liability",
      paragraphs: [
        "To the extent permitted by law, we are not liable for loss arising from reliance on general information on this website. Nothing in these terms limits liability that cannot be limited by law.",
      ],
    },
    {
      heading: "Governing law",
      paragraphs: ["These terms are governed by the laws of India. Courts at Visakhapatnam, Andhra Pradesh, have jurisdiction, subject to applicable law."],
    },
    {
      heading: "Contact",
      paragraphs: [`Questions about these terms: ${siteConfig.contact.email}.`],
    },
  ] satisfies PolicySection[],
};
