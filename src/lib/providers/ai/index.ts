import { GeminiAIProvider } from "@/lib/providers/ai/gemini";
import { MockAIProvider } from "@/lib/providers/ai/mock";
import type { AIProvider } from "@/lib/providers/ai/types";

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const mode = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  const key = process.env.GEMINI_API_KEY;

  if ((mode === "gemini" || mode === "auto") && key) {
    cached = new GeminiAIProvider(key);
    return cached;
  }

  if (mode === "gemini" && !key) {
    console.warn(
      "[ai] AI_PROVIDER=gemini but GEMINI_API_KEY missing — using MockAIProvider",
    );
  }

  cached = new MockAIProvider();
  return cached;
}

/** Test helper — clear cached provider between suites */
export function resetAIProviderCache() {
  cached = null;
}
