import type {
  AIGenerateRequest,
  AIGenerateResult,
  AIProvider,
} from "@/lib/providers/ai/types";

/**
 * Google Gemini adapter via Generative Language API.
 * Requires GEMINI_API_KEY. Never expose the key to the browser.
 */
export class GeminiAIProvider implements AIProvider {
  readonly name = "gemini";

  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  ) {}

  private buildBody(request: AIGenerateRequest) {
    const system = request.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");

    const raw = request.messages
      .filter((m) => m.role !== "system" && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        text: m.content,
      }));

    // Merge consecutive same-role messages to satisfy Gemini alternating turns rule
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
    for (const msg of raw) {
      if (contents.length > 0 && contents[contents.length - 1].role === msg.role) {
        contents[contents.length - 1].parts[0].text += `\n\n${msg.text}`;
      } else {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.text }],
        });
      }
    }

    // Gemini requires the conversation to begin with a user turn
    while (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }

    return {
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.4,
        maxOutputTokens: request.maxTokens ?? 400,
        ...(request.purpose === "safety" ? { responseMimeType: "application/json" } : {}),
      },
    };
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResult> {
    const started = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.buildBody(request)),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      };
    };

    const text =
      json.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim() ||
      "I am here with you. If you prefer a person, use Talk to a human. For immediate danger, use Help / Safety.";

    return {
      text,
      provider: this.name,
      model: this.model,
      inputTokens: json.usageMetadata?.promptTokenCount,
      outputTokens: json.usageMetadata?.candidatesTokenCount,
      latencyMs: Date.now() - started,
    };
  }

  async *stream(request: AIGenerateRequest): AsyncIterable<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.buildBody(request)),
    });

    if (!res.ok || !res.body) {
      // Fallback to non-streaming generate
      const full = await this.generate(request);
      yield full.text;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";

      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          const text = json.candidates?.[0]?.content?.parts
            ?.map((p) => p.text ?? "")
            .join("");
          if (text) yield text;
        } catch {
          // ignore partial JSON frames
        }
      }
    }
  }
}
