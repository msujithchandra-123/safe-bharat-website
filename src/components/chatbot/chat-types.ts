import type { ChatAction, ChatLink } from "@/lib/ai/types";

export type LeadType = "QUOTE" | "AMC" | "CALLBACK";

export type UiMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      content: string;
      /** welcome and notice messages are UI-only and never sent to the model. */
      kind: "answer" | "emergency" | "welcome" | "notice";
      action?: ChatAction;
      service?: string | null;
      links?: ChatLink[];
    }
  | { id: string; role: "widget"; widget: "lead"; leadType: LeadType; service?: string | null; prefill?: string }
  | { id: string; role: "widget"; widget: "handoff" };

let counter = 0;
export const uid = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

export const WELCOME =
  "Welcome to Safe Bharat! I'm your fire safety assistant. I can help you explore our services, understand our maintenance offerings, or submit a quotation enquiry. How can I help you today?";
