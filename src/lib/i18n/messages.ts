/**
 * Minimal i18n dictionaries — do not hard-code all UI strings forever.
 */

export type AppLocale = "en" | "hi" | "hinglish";

const STRINGS = {
  en: {
    "nav.companion": "Companion",
    "nav.support": "Human support",
    "nav.help": "Help / Safety",
    "chat.aiLabel": "ManoYug AI",
    "chat.disclaimer": "AI companion — not a therapist or emergency service.",
    "cta.talkAi": "Talk to ManoYug AI",
    "cta.talkHuman": "Talk to a human",
    "checkin.title": "Daily check-in",
    "checkin.notClinical": "Not a clinical score.",
  },
  hi: {
    "nav.companion": "साथी",
    "nav.support": "मानव सहायता",
    "nav.help": "मदद / सुरक्षा",
    "chat.aiLabel": "ManoYug AI",
    "chat.disclaimer": "AI साथी — चिकित्सक या आपातकालीन सेवा नहीं।",
    "cta.talkAi": "ManoYug AI से बात करें",
    "cta.talkHuman": "किसी व्यक्ति से बात करें",
    "checkin.title": "दैनिक चेक-इन",
    "checkin.notClinical": "यह नैदानिक स्कोर नहीं है।",
  },
  hinglish: {
    "nav.companion": "Companion",
    "nav.support": "Human support",
    "nav.help": "Help / Safety",
    "chat.aiLabel": "ManoYug AI",
    "chat.disclaimer": "AI companion hai — therapist ya emergency service nahi.",
    "cta.talkAi": "ManoYug AI se baat karo",
    "cta.talkHuman": "Human se baat karo",
    "checkin.title": "Daily check-in",
    "checkin.notClinical": "Yeh clinical score nahi hai.",
  },
} as const;

export type MessageKey = keyof (typeof STRINGS)["en"];

export function t(locale: AppLocale, key: MessageKey): string {
  return STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
}

export function getDictionary(locale: AppLocale) {
  return STRINGS[locale];
}
