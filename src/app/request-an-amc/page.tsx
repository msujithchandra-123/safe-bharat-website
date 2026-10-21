import { AMCForm } from "@/components/forms/enquiry-forms";
import { EnquiryPageLayout } from "@/components/sections/enquiry-page-layout";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Request a Fire Safety AMC Proposal",
  description: "Request an Annual Maintenance Contract proposal for fire extinguishers, fire alarm, hydrant and sprinkler systems.",
  path: "/request-an-amc",
});

export default function RequestAmcPage() {
  return (
    <EnquiryPageLayout
      title="Request an AMC"
      intro="Tell us which systems you need maintained. We will survey the equipment and propose a contract with clearly defined coverage, visit frequency and reporting."
      breadcrumbs={[{ label: "Request an AMC", href: "/request-an-amc" }]}
      steps={[
        "You receive a reference number as soon as your request is submitted.",
        "We arrange a survey of the equipment to be covered.",
        "You receive a written AMC proposal with coverage, frequency, exclusions and terms.",
      ]}
    >
      <AMCForm />
    </EnquiryPageLayout>
  );
}
