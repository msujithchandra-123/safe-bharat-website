import { privacyPolicy } from "@/content/legal";
import { PolicyPage } from "@/components/sections/policy-page";
import { serverEnv } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Safe Bharat collects, uses and protects personal data submitted through this website and its AI assistant.",
  path: "/privacy-policy",
});

const AI_PROVIDER_LABELS: Record<string, string> = { anthropic: "Anthropic", gemini: "Google (Gemini API)" };

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      path="/privacy-policy"
      lastUpdated={privacyPolicy.lastUpdated}
      sections={privacyPolicy.sections(serverEnv.retentionDays(), AI_PROVIDER_LABELS[serverEnv.llm().provider] ?? "Our AI provider")}
    />
  );
}
