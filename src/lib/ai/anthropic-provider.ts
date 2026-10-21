import Anthropic from "@anthropic-ai/sdk";
import { ChatProviderError, type ChatProvider, type ProviderRequest, type ProviderResult } from "@/lib/ai/types";

/** Models that support server-side refusal fallback with `fallbacks: "default"`. */
const SERVER_FALLBACK_MODELS = /^claude-(opus-5|opus-5-5|fable-5-1|sonnet-5-5)$/;

export class AnthropicChatProvider implements ChatProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(
    apiKey: string,
    readonly model: string,
    private readonly effort: "low" | "medium" | "high" = "low",
  ) {
    this.client = new Anthropic({ apiKey, timeout: 30_000, maxRetries: 1 });
  }

  async generate(request: ProviderRequest, options: { signal?: AbortSignal } = {}): Promise<ProviderResult> {
    const history: Anthropic.Beta.BetaMessageParam[] = request.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
    const latest = request.messages.at(-1);
    if (!latest) throw new ChatProviderError("No message", "bad_request");

    const useFallback = SERVER_FALLBACK_MODELS.test(this.model);
    try {
      const response = await this.client.beta.messages.create(
        {
          model: this.model,
          max_tokens: 4000,
          ...(useFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
          output_config: { effort: this.effort, format: { type: "json_schema", schema: request.outputSchema } },
          // The system prompt is static, so it is cached across requests.
          system: [{ type: "text", text: request.system, cache_control: { type: "ephemeral" } }],
          messages: [
            ...history,
            {
              role: "user",
              content: [
                { type: "text", text: request.knowledge },
                { type: "text", text: `<visitor_message>\n${latest.content}\n</visitor_message>` },
              ],
            },
          ],
        },
        { signal: options.signal },
      );

      const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text ?? null;
      return {
        outputText: response.stop_reason === "refusal" ? null : text,
        stopReason: response.stop_reason,
        usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
        model: response.model,
      };
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) throw new ChatProviderError("Provider rate limited", "rate_limited");
      if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
        throw new ChatProviderError("Provider authentication failed", "auth");
      }
      if (error instanceof Anthropic.BadRequestError) throw new ChatProviderError("Provider rejected request", "bad_request");
      if (error instanceof Anthropic.APIError || error instanceof Anthropic.APIConnectionError) {
        throw new ChatProviderError("Provider unavailable", "unavailable");
      }
      throw error;
    }
  }
}
