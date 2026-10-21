import "server-only";
import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { AnthropicChatProvider } from "@/lib/ai/anthropic-provider";
import { GeminiChatProvider } from "@/lib/ai/gemini-provider";
import type { ChatProvider } from "@/lib/ai/types";

/**
 * The assistant provider is chosen explicitly with LLM_PROVIDER ("anthropic" or
 * "gemini"). There is no automatic failover: if the chosen provider has no key
 * or fails, the chat API reports the assistant as unavailable instead of quietly
 * sending visitors' messages to a different company.
 */
export function activeChatProvider(): { name: string; configured: boolean } {
  const name = serverEnv.llm().provider;
  if (name === "anthropic") return { name, configured: Boolean(serverEnv.llm().apiKey) };
  if (name === "gemini") return { name, configured: Boolean(serverEnv.gemini().apiKey) };
  return { name, configured: false };
}

export function createChatProvider(): ChatProvider | null {
  const llm = serverEnv.llm();
  switch (llm.provider) {
    case "anthropic":
      return llm.apiKey ? new AnthropicChatProvider(llm.apiKey, llm.model, llm.effort) : null;
    case "gemini": {
      const gemini = serverEnv.gemini();
      return gemini.apiKey ? new GeminiChatProvider(gemini.apiKey, gemini.model, gemini.thinkingLevel) : null;
    }
    default:
      logger.error("chat.unknown_provider", { provider: llm.provider });
      return null;
  }
}

export function chatConfigured(): boolean {
  return activeChatProvider().configured;
}

/** Every AI key, so replies can be checked for accidental leaks regardless of the active provider. */
export function chatSecrets(): string[] {
  return [serverEnv.llm().apiKey, serverEnv.gemini().apiKey].filter((s): s is string => Boolean(s));
}
