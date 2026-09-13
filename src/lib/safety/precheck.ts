import type {
  SafetyAssessment,
  SafetyPrecheckInput,
  SafetySignal,
} from "@/lib/safety/types";

const CURRENT_POLICY_VERSION = "safety-policy-v1.0.0";

/**
 * Conservative deterministic floor. This is intentionally broader than a
 * handful of exact English keywords: students may use slang, transliteration,
 * misspellings, indirect goodbye language, or Devanagari Hindi. A future
 * multilingual classifier can add signals, but it must never downgrade these
 * application-owned decisions.
 */
const SIGNAL_PATTERNS: Array<{ signal: SafetySignal; pattern: RegExp }> = [
  {
    signal: "suicidal_ideation",
    pattern:
      /(?:\b(?:kill myself|kill me|end my life|end it all|want to die|no reason to live|better off dead|suicide|suicidal|suicid|sucide|suicde|aatmahatya|khudkushi|marna chahta(?: hoon)?|marna chahti(?: hoon)?|mar jana chahta|mar\s+j(?:a|aa)u(?:n)?|jeena nahi|jeene ka mann nahi|zinda nahi rehna|cannot go on|can't go on|not worth living|nothing to live for|wish i wouldn't wake up|wish i could disappear|better without me|last message|last goodbye)\b|मरना है|मर जाना है|मर जाऊँ|मर जाऊं|खुदकुशी|आत्महत्या|जीने का मन नहीं|जीना नहीं है|जीने की इच्छा नहीं|मैं नहीं रहूँगा|मैं नहीं रहूंगी|कल नहीं रहूँगा|सब खत्म कर दूँ)/iu,
  },
  {
    signal: "self_harm_language",
    pattern:
      /(?:\b(?:cut myself|cutting myself|self[-\s]?harm|hurt myself|harm myself|burn myself|scratch myself|take all my pills|khud ko nuksan|khud ko chot|apne aap ko nuksan|apne aap ko chot)\b|खुद को नुकसान|अपने आप को नुकसान|खुद को चोट|अपने आप को चोट|मैं खुद को चोट)/iu,
  },
  {
    signal: "immediate_danger",
    pattern:
      /(?:\b(?:have a plan|about to hurt myself|about to kill myself|want to hurt myself|want to harm myself|thinking of hurting myself|going to (?:suicide|sucide|kill myself|end it)|gonna (?:kill myself|end it|hurt myself|harm myself)|(?:i|i'm|im|he|she|they|woh)\s+(?:(?:am|is|are)\s+)?(?:going to|gonna|about to|might)\s+(?:hurt|harm)\s+(?:myself|himself|herself|themselves)|cannot stay safe|can\s*'?t stay safe|might act on it|tonight i will|this is my last night|right now i might|abhi karunga|abhi karungi|abhi karne wala|abhi karne wali|aaj raat karunga|aaj raat karungi)\b|अभी करूँगा|अभी करूंगी|अभी करने वाला|अभी करने वाली|आज रात करूँगा|आज रात करूंगी|मैं सुरक्षित नहीं हूँ|खुद को नुकसान पहुँचाऊँगा|खुद को नुकसान पहुँचाऊँगी|खुद को मार डालूँगा|खुद को मार डालूँगी)/iu,
  },
  {
    signal: "hopelessness",
    pattern:
      /(?:\b(?:no point|hopeless|nothing matters|life is pointless|koi faayda nahi|sab khatam|kuch theek nahi hoga|i can't do this anymore|cannot do this anymore|everything is over|there is no point)\b|कोई फायदा नहीं|सब खत्म हो गया|कुछ ठीक नहीं होगा|अब और नहीं सह सकता|अब और नहीं सह सकती|सब बेकार है)/iu,
  },
  {
    signal: "abuse_or_ragging",
    pattern: /\b(ragging|ragged|sexually assaulted|being abused|harassed)\b/i,
  },
  {
    signal: "violence_risk",
    pattern: /\b(kill them|hurt someone|hurt (him|her)|attack|bomb|shoot|maar dunga|maar dungi)\b/i,
  },
  {
    signal: "medical_emergency_language",
    pattern:
      /\b(chest pain|can\s*'?t breathe|overdose|unconscious|seizure|poisoning|bleeding heavily)\b/i,
  },
];

function rankState(signals: SafetySignal[], text: string): SafetyAssessment["state"] {
  const directSelfRisk = /(?:\b(?:i|im|i'm|he|she|they|woh)\b[^.?!\n]{0,30}\b(?:want to|will|am going to|going to|gonna|might|plan to|thinking of)\b[^.?!\n]{0,35}\b(?:kill|hurt|harm|cut|end|die|suicide|sucide|mar(?:na| jau)|khudkushi)\b|\b(?:i am suicidal|i'm suicidal|kill myself|hurt myself|harm myself|end my life|want to die|gonna kill myself|going to kill myself|this is my last message|this is my last night|mann kar raha hai ki mar jau|mann kar raha hai mar jau|marne ka mann kar raha hai)\b|मरना है|मर जाना है|मर जाऊँ|खुदकुशी|खुद को नुकसान|जीने का मन नहीं|जीने का मन नहीं है|जीने की इच्छा नहीं)/iu.test(text);
  if (
    signals.includes("immediate_danger") &&
    (signals.includes("suicidal_ideation") ||
      signals.includes("self_harm_language") ||
      signals.includes("medical_emergency_language"))
  ) {
    return "IMMINENT";
  }
  if (
    (signals.includes("suicidal_ideation") && directSelfRisk) ||
    signals.includes("immediate_danger") ||
    signals.includes("medical_emergency_language") ||
    signals.includes("violence_risk")
  ) {
    return "RED";
  }
  if (
    signals.includes("self_harm_language") ||
    signals.includes("severe_distress") ||
    signals.includes("abuse_or_ragging") ||
    signals.includes("hopelessness")
  ) {
    return "AMBER";
  }
  return "GREEN";
}

function actionFor(
  state: SafetyAssessment["state"],
): SafetyAssessment["recommended_action"] {
  switch (state) {
    case "IMMINENT":
      return "show_crisis_interface";
    case "RED":
      return "show_elevated_resources";
    case "AMBER":
      return "offer_human_support";
    default:
      return "continue_support";
  }
}

function normalizeSafetyText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[’‘`]/g, "'")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Safety preprocessor — application authority, not the LLM.
 * Expand with multi-signal ML assist in Phase 3; keep deterministic floor.
 */
export function runSafetyPrecheck(
  input: SafetyPrecheckInput,
): SafetyAssessment {
  const text = normalizeSafetyText(input.text);
  const signals = SIGNAL_PATTERNS.filter(({ pattern }) =>
    pattern.test(text),
  ).map(({ signal }) => signal);

  const unique = [...new Set(signals)];
  const state = rankState(unique, text);

  return {
    state,
    confidence: unique.length === 0 ? 0.4 : Math.min(0.55 + unique.length * 0.1, 0.9),
    signals: unique,
    recommended_action: actionFor(state),
    policy_version: CURRENT_POLICY_VERSION,
  };
}

export function isCrisisUxRequired(state: SafetyAssessment["state"]): boolean {
  return state === "IMMINENT" || state === "RED";
}
