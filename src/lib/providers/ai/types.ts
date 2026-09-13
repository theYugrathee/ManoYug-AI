export type AIPurpose =
  | "conversation"
  | "classification"
  | "safety"
  | "summarization"
  | "embeddings";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIGenerateRequest {
  purpose: AIPurpose;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Never send full name/phone/email/roll unless genuinely required */
  studentInternalId?: string;
  language?: "en" | "hi" | "hinglish";
}

export interface AIGenerateResult {
  text: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
}

export interface AIProvider {
  readonly name: string;
  generate(request: AIGenerateRequest): Promise<AIGenerateResult>;
  stream?(
    request: AIGenerateRequest,
  ): AsyncIterable<string>;
}
