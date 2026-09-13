# ManoYug AI — Safety

## Principle

The LLM is **not** the safety authority. Application modules decide operational state and UX.

## Pipeline

1. **Precheck** — deterministic signal patterns → GREEN / AMBER / RED / IMMINENT  
2. **Model** — language generation only (when allowed)  
3. **Postcheck** — blocks unsafe assistant content; never downgrades crisis precheck  
4. **Action router** — maps assessment → UI mode + escalation flags  

## Crisis UX

For IMMINENT (and blocked unsafe content): pause normal chat; show verified resources from the registry (e.g. Tele-MANAS). Never invent phone numbers in prompts.

## Fabricated actions

The system must never claim “I called your counsellor / parents / police” unless a backend integration actually succeeded. Postcheck blocks such phrases.

## Evaluations

`/super-admin/evaluations` runs the internal suite (stress, Hinglish, injection, self-harm, ragging). Critical failures should block deploy in CI.
