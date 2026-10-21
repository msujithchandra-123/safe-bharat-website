import { termsOfUse } from "@/content/legal";
import { PolicyPage } from "@/components/sections/policy-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms governing the use of the Safe Bharat Fire and Safety Solutions website and its AI assistant.",
  path: "/terms",
});

export default function TermsPage() {
  return <PolicyPage title="Terms of Use" path="/terms" lastUpdated={termsOfUse.lastUpdated} sections={termsOfUse.sections} />;
}
