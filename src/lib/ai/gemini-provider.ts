import { ApiError, GoogleGenAI, ThinkingLevel, type Content, type GenerateContentParameters, type GenerateContentResponse } from "@google/genai";
import { ChatProviderError, type ChatProvider, type ProviderRequest, type ProviderResult } from "@/lib/ai/types";

/** The part of the official SDK client this provider uses; injectable so tests never call the network. */
export interface GeminiModelsClient {
  generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>;
}

export type GeminiThinkingLevel = "minimal" | "low" | "medium" | "high";

const THINKING_LEVELS: Record<GeminiThinkingLevel, ThinkingLevel> = {
  minimal: ThinkingLevel.MINIMAL,
  low: ThinkingLevel.LOW,
  medium: ThinkingLevel.MEDIUM,
  high: ThinkingLevel.HIGH,
};

/**
 * Google Gemini via the official @google/genai SDK (models.generateContent).
 * Same contract as the Anthropic provider: the system prompt and the retrieved
 * knowledge are sent separately from the visitor's text, and the model must
 * return JSON matching the chat output schema, which the chat service validates.
 */
export class GeminiChatProvider implements ChatProvider {
  readonly name = "gemini";
  private readonly models: GeminiModelsClient;

  constructor(
    apiKey: string,
    readonly model: string,
    private readonly thinkingLevel: GeminiThinkingLevel = "low",
    client?: GeminiModelsClient,
    timeoutMs = 30_000,
  ) {
    this.models = client ?? new GoogleGenAI({ apiKey, httpOptions: { timeout: timeoutMs } }).models;
  }

  async generate(request: ProviderRequest, options: { signal?: AbortSignal } = {}): Promise<ProviderResult> {
    const latest = request.messages.at(-1);
    if (!latest) throw new ChatProviderError("No message", "bad_request");

    // Gemini uses "user" and "model" roles.
    const history: Content[] = request.messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const contents: Content[] = [
      ...history,
      { role: "user", parts: [{ text: request.knowledge }, { text: `<visitor_message>\n${latest.content}\n</visitor_message>` }] },
    ];

    let response: GenerateContentResponse;
    try {
      response = await this.models.generateContent({
        model: this.model,
        contents,
        config: {
          systemInstruction: request.system,
          responseMimeType: "application/json",
          responseJsonSchema: request.outputSchema,
          maxOutputTokens: 2000,
          thinkingConfig: { thinkingLevel: THINKING_LEVELS[this.thinkingLevel] },
          abortSignal: options.signal,
        },
      });
    } catch (error) {
      throw toProviderError(error);
    }

    const candidate = response.candidates?.[0];
    const blocked = response.promptFeedback?.blockReason;
    const finishReason = blocked ? `PROMPT_BLOCKED_${blocked}` : (candidate?.finishReason ?? null);
    // Only a normally finished answer is used; safety blocks, truncation and empty output
    // return null, which the chat service turns into its safe "contact the team" reply.
    const text =
      finishReason === "STOP"
        ? (candidate?.content?.parts ?? [])
            .filter((p) => typeof p.text === "string" && !p.thought)
            .map((p) => p.text)
            .join("")
        : "";

    return {
      outputText: text ? text : null,
      stopReason: finishReason,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: (response.usageMetadata?.candidatesTokenCount ?? 0) + (response.usageMetadata?.thoughtsTokenCount ?? 0),
      },
      model: response.modelVersion ?? this.model,
    };
  }
}

/** Maps SDK and network failures onto the provider-neutral error kinds the chat service understands. */
export function toProviderError(error: unknown): ChatProviderError {
  if (error instanceof ApiError) {
    if (error.status === 429) return new ChatProviderError("Provider rate limited", "rate_limited");
    if (error.status === 401 || error.status === 403) return new ChatProviderError("Provider authentication failed", "auth");
    if (error.status === 400 || error.status === 404) return new ChatProviderError("Provider rejected request", "bad_request");
    return new ChatProviderError("Provider unavailable", "unavailable");
  }
  // Timeouts, aborts and network errors are temporary.
  return new ChatProviderError("Provider unavailable", "unavailable");
}
