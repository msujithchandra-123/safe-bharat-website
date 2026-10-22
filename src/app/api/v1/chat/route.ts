import { serverEnv } from "@/lib/env";
import { handleChatRequest } from "@/lib/ai/handle-chat-request";
import { getKnowledgeIndex } from "@/lib/ai/knowledge";
import { chatSecrets, createChatProvider } from "@/lib/ai/provider";
import { rateLimitStore } from "@/lib/runtime";

export async function POST(request: Request): Promise<Response> {
  return handleChatRequest(request, {
    chat: () => ({
      provider: createChatProvider(),
      knowledge: getKnowledgeIndex(),
      secrets: [...chatSecrets(), serverEnv.email().password].filter((s): s is string => Boolean(s)),
    }),
    rateLimitStore,
    rateLimitSalt: serverEnv.rateLimitSalt(),
  });
}
