// @vitest-environment node
// Server-side code: runs in Node, as in production (the Anthropic SDK refuses browser-like environments).
import { afterEach, describe, expect, it } from "vitest";
import { ApiError, ThinkingLevel, type GenerateContentParameters, type GenerateContentResponse } from "@google/genai";
import { GeminiChatProvider, type GeminiModelsClient } from "@/lib/ai/gemini-provider";
import { generateChatReply } from "@/lib/ai/chat-service";
import { buildKnowledgeBase, KnowledgeIndex } from "@/lib/ai/knowledge";
import { OUTPUT_JSON_SCHEMA, SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { ChatProviderError, type ProviderRequest } from "@/lib/ai/types";
import { activeChatProvider, chatConfigured, chatSecrets, createChatProvider } from "@/lib/ai/provider";

/** Fake SDK client: records requests, returns a canned response or throws. No network access. */
class FakeModels implements GeminiModelsClient {
  calls: GenerateContentParameters[] = [];
  constructor(private readonly respond: () => GenerateContentResponse | Error) {}
  async generateContent(params: GenerateContentParameters) {
    this.calls.push(params);
    const r = this.respond();
    if (r instanceof Error || r instanceof DOMException) throw r;
    return r;
  }
}

const answer = (text: string, finishReason = "STOP", extra: Record<string, unknown> = {}) =>
  ({
    candidates: [{ finishReason, content: { role: "model", parts: [{ text: "internal reasoning", thought: true }, { text }] } }],
    usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 30, thoughtsTokenCount: 10 },
    modelVersion: "gemini-3.5-flash-lite",
    ...extra,
  }) as unknown as GenerateContentResponse;

const json = (o: Record<string, unknown>) => JSON.stringify({ reply: "Answer", action: "none", service: "none", sources: [], ...o });

const request: ProviderRequest = {
  system: SYSTEM_PROMPT,
  messages: [
    { role: "user", content: "Do you service fire alarms?" },
    { role: "assistant", content: "Yes, we do." },
    { role: "user", content: "What about AMC?" },
  ],
  knowledge: "<knowledge>docs</knowledge>",
  outputSchema: OUTPUT_JSON_SCHEMA,
};

describe("GeminiChatProvider request", () => {
  it("sends the system prompt, schema, roles, knowledge and visitor text in the documented shape", async () => {
    const models = new FakeModels(() => answer(json({ reply: "AMCs are available." })));
    const signal = new AbortController().signal;
    await new GeminiChatProvider("test-key", "gemini-3.5-flash-lite", "low", models).generate(request, { signal });
    const call = models.calls[0]!;
    expect(call.model).toBe("gemini-3.5-flash-lite");
    expect(call.config?.systemInstruction).toBe(SYSTEM_PROMPT);
    expect(call.config?.responseMimeType).toBe("application/json");
    expect(call.config?.responseJsonSchema).toEqual(OUTPUT_JSON_SCHEMA);
    expect(call.config?.thinkingConfig?.thinkingLevel).toBe(ThinkingLevel.LOW);
    expect(call.config?.abortSignal).toBe(signal);
    const contents = call.contents as { role: string; parts: { text: string }[] }[];
    expect(contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    // Knowledge and the visitor's words are separate parts of the last turn, never part of the system prompt.
    expect(contents[2]!.parts.map((p) => p.text)).toEqual(["<knowledge>docs</knowledge>", "<visitor_message>\nWhat about AMC?\n</visitor_message>"]);
    expect(String(call.config?.systemInstruction)).not.toContain("What about AMC?");
  });

  it("maps every thinking level setting", async () => {
    for (const [level, expected] of [["minimal", ThinkingLevel.MINIMAL], ["medium", ThinkingLevel.MEDIUM], ["high", ThinkingLevel.HIGH]] as const) {
      const models = new FakeModels(() => answer(json({})));
      await new GeminiChatProvider("k", "m", level, models).generate(request);
      expect(models.calls[0]!.config?.thinkingConfig?.thinkingLevel).toBe(expected);
    }
  });
});

describe("GeminiChatProvider response handling", () => {
  it("returns only the answer text, ignoring thought parts, with usage", async () => {
    const out = json({ reply: "Yes." });
    const r = await new GeminiChatProvider("k", "gemini-3.5-flash-lite", "low", new FakeModels(() => answer(out))).generate(request);
    expect(r).toEqual({ outputText: out, stopReason: "STOP", usage: { inputTokens: 120, outputTokens: 40 }, model: "gemini-3.5-flash-lite" });
  });

  it.each(["SAFETY", "MAX_TOKENS", "RECITATION", "OTHER"])("returns no text when generation ends with %s", async (reason) => {
    const r = await new GeminiChatProvider("k", "m", "low", new FakeModels(() => answer(json({}), reason))).generate(request);
    expect(r.outputText).toBeNull();
    expect(r.stopReason).toBe(reason);
  });

  it("returns no text when the prompt itself is blocked", async () => {
    const blocked = { candidates: [], promptFeedback: { blockReason: "SAFETY" } } as unknown as GenerateContentResponse;
    const r = await new GeminiChatProvider("k", "m", "low", new FakeModels(() => blocked)).generate(request);
    expect(r).toMatchObject({ outputText: null, stopReason: "PROMPT_BLOCKED_SAFETY" });
  });
});

describe("GeminiChatProvider error mapping", () => {
  const cases: [string, Error, ChatProviderError["kind"]][] = [
    ["429 rate limit", new ApiError({ message: "quota", status: 429 }), "rate_limited"],
    ["401 invalid key", new ApiError({ message: "bad key", status: 401 }), "auth"],
    ["403 forbidden", new ApiError({ message: "denied", status: 403 }), "auth"],
    ["400 bad request", new ApiError({ message: "bad", status: 400 }), "bad_request"],
    ["404 unknown model", new ApiError({ message: "no model", status: 404 }), "bad_request"],
    ["503 overloaded", new ApiError({ message: "busy", status: 503 }), "unavailable"],
    ["timeout", new DOMException("timed out", "TimeoutError"), "unavailable"],
    ["network failure", new TypeError("fetch failed"), "unavailable"],
  ];
  it.each(cases)("maps %s", async (_label, error, kind) => {
    const provider = new GeminiChatProvider("k", "m", "low", new FakeModels(() => error));
    await expect(provider.generate(request)).rejects.toMatchObject({ name: "ChatProviderError", kind });
  });

  it("never includes the API key in an error", async () => {
    const provider = new GeminiChatProvider("AIzaSECRETKEYVALUE123", "m", "low", new FakeModels(() => new ApiError({ message: "denied", status: 403 })));
    await expect(provider.generate(request)).rejects.toSatisfy((e: Error) => !e.message.includes("AIzaSECRETKEYVALUE123"));
  });
});

describe("Gemini through the existing chat service", () => {
  const knowledge = new KnowledgeIndex(buildKnowledgeBase());

  it("produces a validated reply with links and actions", async () => {
    const models = new FakeModels(() => answer(json({ reply: "We offer AMCs.", action: "open_amc_form", service: "amc-maintenance", sources: ["service:amc-maintenance"] })));
    const r = await generateChatReply([{ role: "user", content: "Do you offer AMC?" }], { provider: new GeminiChatProvider("k", "m", "low", models), knowledge });
    expect(r).toMatchObject({ kind: "answer", reply: "We offer AMCs.", action: "open_amc_form", service: "amc-maintenance" });
    expect(r.links[0]?.href).toBe("/services/amc-maintenance");
  });

  it("keeps emergency guidance local: Gemini is never called", async () => {
    const models = new FakeModels(() => answer(json({})));
    const r = await generateChatReply([{ role: "user", content: "There is a fire in our warehouse!" }], { provider: new GeminiChatProvider("k", "m", "low", models), knowledge });
    expect(r.kind).toBe("emergency");
    expect(models.calls).toHaveLength(0);
  });

  it("turns a safety block into the safe contact reply", async () => {
    const models = new FakeModels(() => answer(json({}), "SAFETY"));
    const r = await generateChatReply([{ role: "user", content: "hello" }], { provider: new GeminiChatProvider("k", "m", "low", models), knowledge });
    expect(r.action).toBe("show_contact_options");
  });

  it("reports a rate limit as temporary (busy), and a bad key as unavailable", async () => {
    const busy = new GeminiChatProvider("k", "m", "low", new FakeModels(() => new ApiError({ message: "q", status: 429 })));
    await expect(generateChatReply([{ role: "user", content: "hi" }], { provider: busy, knowledge })).rejects.toMatchObject({ reason: "busy" });
    const badKey = new GeminiChatProvider("k", "m", "low", new FakeModels(() => new ApiError({ message: "k", status: 401 })));
    await expect(generateChatReply([{ role: "user", content: "hi" }], { provider: badKey, knowledge })).rejects.toMatchObject({ reason: "provider-error" });
  });
});

describe("provider selection (no silent switching)", () => {
  const KEYS = ["LLM_PROVIDER", "LLM_API_KEY", "GEMINI_API_KEY", "GEMINI_MODEL", "GEMINI_THINKING_LEVEL"] as const;
  const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });
  const set = (v: Partial<Record<(typeof KEYS)[number], string>>) => {
    for (const k of KEYS) delete process.env[k];
    Object.assign(process.env, v);
  };

  it("uses Gemini when LLM_PROVIDER=gemini and GEMINI_API_KEY is set", () => {
    set({ LLM_PROVIDER: "gemini", GEMINI_API_KEY: "AIza-test-key" });
    const p = createChatProvider();
    expect(p?.name).toBe("gemini");
    expect(p?.model).toBe("gemini-3.5-flash-lite");
    expect(chatConfigured()).toBe(true);
    expect(activeChatProvider()).toEqual({ name: "gemini", configured: true });
  });

  it("honours GEMINI_MODEL", () => {
    set({ LLM_PROVIDER: "gemini", GEMINI_API_KEY: "AIza-test-key", GEMINI_MODEL: "gemini-3.8-flash" });
    expect(createChatProvider()?.model).toBe("gemini-3.8-flash");
  });

  it("stays offline when Gemini is selected without its key, even if an Anthropic key exists", () => {
    set({ LLM_PROVIDER: "gemini", LLM_API_KEY: "sk-ant-test" });
    expect(createChatProvider()).toBeNull();
    expect(chatConfigured()).toBe(false);
  });

  it("keeps Anthropic working when selected, ignoring a Gemini key", () => {
    set({ LLM_PROVIDER: "anthropic", LLM_API_KEY: "sk-ant-test", GEMINI_API_KEY: "AIza-test-key" });
    expect(createChatProvider()?.name).toBe("anthropic");
  });

  it("rejects an unknown provider name", () => {
    set({ LLM_PROVIDER: "something-else", GEMINI_API_KEY: "AIza-test-key" });
    expect(createChatProvider()).toBeNull();
    expect(chatConfigured()).toBe(false);
  });

  it("includes every AI key in the reply leak check", () => {
    set({ LLM_PROVIDER: "gemini", LLM_API_KEY: "sk-ant-test", GEMINI_API_KEY: "AIza-test-key" });
    expect(chatSecrets().sort()).toEqual(["AIza-test-key", "sk-ant-test"]);
  });
});
