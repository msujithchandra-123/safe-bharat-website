import { QuoteForm } from "@/components/forms/enquiry-forms";
import { EnquiryPageLayout } from "@/components/sections/enquiry-page-layout";
import { serverEnv } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Request a Fire Protection Quote",
  description: "Request a quotation for fire protection systems, fire alarms, extinguishers, installation, equipment supply or other Safe Bharat services.",
  path: "/request-a-quote",
});

export default function RequestQuotePage() {
  const uploads = serverEnv.attachments().configured;
  return (
    <EnquiryPageLayout
      title="Request a quote"
      intro="Tell us about your site and requirement. The more detail you share, the more useful our first response will be."
      breadcrumbs={[{ label: "Request a Quote", href: "/request-a-quote" }]}
      steps={[
        "You receive a reference number as soon as your request is submitted.",
        "Our team reviews the requirement and may ask for drawings, quantities or a site visit.",
        "We send a written proposal and quotation for your review.",
      ]}
    >
      <QuoteForm attachmentsEnabled={uploads} />
    </EnquiryPageLayout>
  );
}
