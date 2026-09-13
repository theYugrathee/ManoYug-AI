# ManoYug AI

Multi-tenant B2B student wellbeing platform (Next.js + Supabase).

## Specs

- `blueprint.md` — product build spec  
- `docs/PROJECT_STATUS.md` — living progress  
- `docs/ARCHITECTURE.md` · `docs/SAFETY.md` · `docs/IMPLEMENTATION_PLAN.md`

## Run now (no keys required)

```bash
pnpm install
pnpm dev
```

Works offline with **Mock AI** + labelled in-memory store:

| Path | What |
|------|------|
| `/student` | Dashboard, chat, check-in, exercises, support, appointments, timeline |
| `/counsellor` | Escalation queue + case detail |
| `/institution` | CSV roster import + analytics |
| `/super-admin` | Tenants, AI cost estimates, eval suite |

Auth forms work; without Supabase they return an honest “not configured” error.

## When you’re ready (your step)

1. Supabase project → run SQL in `supabase/migrations/` (order by filename)  
2. `cp .env.example .env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optional: `GEMINI_API_KEY`, `RESEND_API_KEY`  
3. Enable Auth email OTP in Supabase dashboard  
4. `pnpm build` / deploy  

`AI_PROVIDER=auto` and `EMAIL_PROVIDER=auto` pick Gemini/Resend when keys exist.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | Playwright smoke (install browsers once) |
| `pnpm lint` | ESLint |

## Principles

- Safety engine outside the LLM  
- No fake production metrics or invented crisis numbers  
- Institution admins do not get private chats by default  
- Provider abstractions for AI / email  
