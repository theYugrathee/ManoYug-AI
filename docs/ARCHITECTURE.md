# ManoYug AI — Architecture

## Stack

- Next.js App Router (TypeScript) on Vercel-ready host
- PostgreSQL + Auth + RLS via Supabase
- Provider abstractions: `AIProvider`, `EmailProvider` (+ storage/analytics planned)
- Safety engine **outside** the LLM

## Request path (chat)

1. Auth / tenant context (middleware + server)
2. Rate limit
3. Permission check
4. Safety **precheck**
5. Approved knowledge retrieval
6. Versioned system prompt
7. Model via AI gateway (Gemini or Mock)
8. Safety **postcheck**
9. Action router → UI mode (normal / elevated / crisis / blocked)
10. Persist messages + optional case escalation
11. AI usage metering

## Multi-tenancy

Every tenant-owned row carries `institution_id` (or joins to it). RLS + server-side capability checks. Institution admins do **not** receive private chats by default.

## Offline / pre-credentials mode

When Supabase env vars are absent, product flows use an in-process labelled **dev memory store**. Auth actions refuse with honest errors. No fake production success.

## Key modules

| Area | Path |
|------|------|
| Auth | `src/lib/auth/*` |
| Safety | `src/lib/safety/*` |
| AI gateway | `src/lib/ai/gateway.ts` |
| Prompts | `src/lib/ai/prompts.ts` |
| Knowledge | `src/lib/ai/knowledge.ts` |
| Store | `src/lib/store/memory.ts` |
| Migrations | `supabase/migrations/*` |
