import { siteConfig } from "@/config/site";

/**
 * Deterministic detection of messages that describe an active fire or other
 * immediate danger. These never go to the language model: the visitor gets
 * fixed, safe guidance straight away.
 */
const PATTERNS: RegExp[] = [
  /\b(there('?s| is| are)\s+(a\s+)?fire)\b/i,
  /\b(on fire|caught fire|catching fire|fire (has )?(broken out|started|spreading))\b/i,
  /\b(is|are|it'?s|building|house|factory|plant|room|kitchen)\s+(is\s+)?burning\b/i,
  /\b(smoke (is )?(coming|everywhere|filling|pouring))\b/i,
  /\b(gas leak|leaking gas|smell(ing)? (of )?gas)\b/i,
  /\b(explosion|exploded|blast (just )?happened)\b/i,
  /\b(trapped (inside|in)|(someone|people|person|workers?) (is |are )?trapped)\b/i,
  /\b(this is an emergency|it'?s an emergency|emergency (right )?now|need help (right )?now|help[,!.\s]+fire)\b/i,
  /\b(call (the )?fire (brigade|service|department|engine))\b/i,
  /\baag\s+(lag|lagi|lag gayi|lagi hai)\b/i,
];

export function isEmergencyMessage(text: string): boolean {
  return PATTERNS.some((p) => p.test(text));
}

export const EMERGENCY_REPLY = [
  `If there is a fire or any immediate danger, act now:`,
  `- Raise the alarm and warn people nearby.`,
  `- Follow your site's emergency procedure and evacuate if it is not safe to stay. Do not go back inside.`,
  `- Call the emergency services on ${siteConfig.emergencyNumber} immediately.`,
  ``,
  `Only use an extinguisher on a very small fire if you are trained, the alarm has been raised and your escape route is clear.`,
  ``,
  `I'm an AI assistant and can't send help. Once everyone is safe, the Safe Bharat team can help with follow-up.`,
].join("\n");
