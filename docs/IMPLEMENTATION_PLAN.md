# ManoYug AI — Implementation Plan

**Product:** ManoYug AI — multi-tenant B2B student wellbeing platform  
**Primary channel:** Responsive Web App / PWA  
**Spec sources:** `blueprint.md` (master build spec); root `PROJECT_STATUS.md` (continuity rules)  
**Plan date:** 2026-09-08  
**Status:** Phase 0 complete → Phase 1 scaffold in progress

---

## 0. Repository audit (Phase 0 findings)

| Item | Finding |
|------|---------|
| Existing files | `blueprint.md`, `PROJECT_STATUS.md` (continuity *spec*, not live status) |
| Application code | None — greenfield |
| Framework | None yet |
| Package manager | Will use **pnpm** (lockfile + fast CI); npm acceptable fallback |
| Env / Supabase | Not configured |
| Auth / schema / deploy | Not present |
| Design system / tests | Not present |
| Master blueprint v2.0 PDF/doc | Not in repo; `blueprint.md` treated as authoritative build spec |

**Decision:** Proceed with recommended production stack. Do not wait for missing third-party credentials — use provider interfaces + mock/dev providers.

---

## 1. Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Clients: Student / Counsellor / Institution / Super Admin PWA   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│  Next.js App Router (Vercel)                                     │
│  - Route groups: (public) (student) (counsellor) (institution)   │
│    (super-admin)                                                 │
│  - Middleware: session + role gate (never UI-only auth)          │
│  - Server Actions + Route Handlers (typed contracts)             │
└────────────┬───────────────────────────┬─────────────────────────┘
             │                           │
┌────────────▼────────────┐   ┌──────────▼────────────────────────┐
│  Supabase                │   │  Provider abstractions            │
│  - Postgres + RLS        │   │  AIProvider / EmailProvider       │
│  - Auth (email OTP)      │   │  StorageProvider / AnalyticsProvider│
│  - Storage               │   └──────────┬───────────────────────┘
└──────────────────────────┘              │
                              ┌───────────▼───────────────────────┐
                              │  Gemini (prod) / Mock (dev)        │
                              │  ZeptoMail SMTP (email OTP)        │
                              └───────────────────────────────────┘
```

**Core product layers (not “chatbot + UI”):**

1. Identity & multi-tenant tenancy  
2. Eligibility / roster  
3. AI companion + gateway  
4. **Safety engine** (outside LLM)  
5. Human escalation + counsellor cases  
6. Privacy-preserving analytics  
7. Governance (prompts, policies, resources, audit)

---

## 2. Technology choices

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript | Production SSR/RSC, middleware auth, Vercel-ready |
| Styling | Tailwind CSS + CSS variables design tokens | Accessible, consistent, no AI-slop defaults |
| Components | Custom accessible primitives (Radix where needed) | WCAG 2.2 AA path without generic SaaS template |
| Backend | Next.js Server Actions + Route Handlers | Colocated, typed; extract workers later if needed |
| DB | PostgreSQL via Supabase | RLS, Auth, Storage in one ops surface |
| Auth | Supabase Auth + email OTP | Matches mandatory OTP; MFA for elevated roles later |
| AI | Gemini via `AIProvider` interface | Spec-mandated; swappable |
| Email | ZeptoMail via Supabase custom SMTP | Transactional OTP delivery |
| Hosting | Vercel | Preview + prod envs |
| Validation | Zod | Shared client/server schemas |
| Tests | Vitest + Playwright + RLS SQL tests | Unit/integration/E2E/security |
| i18n | next-intl (en / hi / hinglish strings) | No hard-coded UI strings |
| Package manager | pnpm | Deterministic installs |

---

## 3. Folder structure

```
/
├── apps/web/                    # OR monorepo root = Next app (chosen: single app at root for speed)
├── docs/                        # Architecture, status, runbooks
├── supabase/
│   ├── migrations/              # Authoritative schema
│   ├── seed/                    # Dev-only labelled seed
│   └── policies/                # RLS helpers if split
├── src/
│   ├── app/
│   │   ├── (public)/            # /, about, safety, privacy, terms, help, contact
│   │   ├── (auth)/              # register, login, otp, onboarding
│   │   ├── student/
│   │   ├── counsellor/
│   │   ├── institution/
│   │   └── super-admin/
│   ├── components/              # UI primitives + feature UI
│   ├── design-system/           # tokens, typography, themes
│   ├── lib/
│   │   ├── auth/                # session, permissions
│   │   ├── db/                  # Supabase clients (server/browser)
│   │   ├── providers/           # AI, Email, Storage, Analytics
│   │   ├── safety/              # pre/post check, policy engine, action router
│   │   ├── ai/                  # gateway, prompts, RAG retrieval
│   │   ├── analytics/           # first-party events
│   │   └── validation/          # Zod schemas
│   ├── middleware.ts
│   └── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── security/
├── .env.example
├── blueprint.md
└── PROJECT_STATUS.md            # Continuity *rules*; live status in docs/PROJECT_STATUS.md
```

**Decision:** Next.js app lives in `/manoyug-ai` (folder name forces npm-safe package name). Specs and `/docs` stay at the parent `Manoyug Ai` folder. Not a multi-package monorepo until scale justifies splitting.

---

## 4. Database schema (core entities)

All tenant-owned rows include `institution_id` (or join path that enforces it). Soft-delete where retention requires.

### Tenancy & identity
- `institutions` — profile, branding, academic year, status, capacity
- `subscriptions` / `contracts` — plan, price, dates, payment status
- `users` — auth user link, email, phone, status
- `memberships` — user ↔ institution ↔ role
- `permissions` / `role_permissions` — capability matrix
- `student_profiles` — graduation year, roll no, language, preferences
- `institution_students` — eligibility roster (CSV + manual); status active/inactive

### Conversations & AI
- `conversations`, `messages`
- `prompt_versions` — DRAFT→ACTIVE lifecycle
- `model_configs` — provider, purpose, limits, cost metadata
- `knowledge_resources` — versioned, approved, tenant or global
- `ai_usage_events` — tokens, latency, cost estimates

### Safety & cases
- `safety_events` — GREEN/AMBER/RED/IMMINENT + signals + policy_version
- `safety_policies` — versioned policies
- `cases` — counsellor workflow statuses
- `counsellor_notes` — restricted visibility
- `escalations`

### Human support
- `counsellor_profiles`, `office_hours`, `availability_slots`
- `appointments`, `waiting_list_entries`
- `resources`, `emergency_contacts` — verification lifecycle

### Wellbeing
- `checkins`, `guided_exercises`, `exercise_completions`
- `student_timeline_events` (derived/materialized views OK)

### Platform
- `analytics_events` — first-party, privacy-conscious
- `audit_logs` — privileged actions
- `feature_flags`
- `break_glass_sessions`
- `evaluations` / `evaluation_runs`
- `notifications`
- `data_retention_policies`, `deletion_requests`

**Migrations:** every change via `supabase/migrations/*.sql`. Never hand-edit prod.

---

## 5. Authentication architecture

1. Student/staff sign-up or invite → Supabase Auth user  
2. Email OTP mandatory before activation  
3. Eligibility match: active `institution_students` row (email + roll + graduation year rules) without enumeration leaks  
4. Session: HttpOnly cookies via Supabase SSR helpers  
5. MFA: required later for PLATFORM_* and INSTITUTION_SUPER_ADMIN  
6. Password: hashed by Auth provider; never plaintext; never in exports  

**Safe messaging:** generic “If eligible, check your email” — no “email exists at University X”.

---

## 6. Authorization architecture

| Mechanism | Role |
|-----------|------|
| Middleware | Route family gate by role |
| Server | Permission check before every mutation/query |
| RLS | Defense in depth on Postgres |
| Capabilities | e.g. `student.conversation.read_own`, `counsellor.case.read_assigned`, `institution.roster.manage`, `platform.break_glass` |

**Roles (least privilege):**  
STUDENT, COUNSELLOR, COUNSELLOR_SUPERVISOR, INSTITUTION_ADMIN, INSTITUTION_SUPER_ADMIN, PLATFORM_SUPPORT, PLATFORM_ADMIN, PLATFORM_SUPER_ADMIN, CLINICAL_REVIEWER, FINANCE

Never trust client-sent `role` or `institution_id`.

---

## 7. AI architecture

```
message → auth → tenant → permission
  → Safety Preprocessor
  → conversation context (minimal PII)
  → approved knowledge retrieval
  → prompt construction (registry version)
  → AI Gateway (model by purpose)
  → LLM
  → Safety Postprocessor
  → Action Router
  → response + analytics (+ case if escalated)
```

Modules: `lib/safety/*`, `lib/ai/gateway.ts`, `lib/ai/prompts.ts`, `lib/ai/rag.ts`.  
LLM is **not** the safety authority. Model cannot override structured safety state.

---

## 8. Safety architecture

- States: GREEN | AMBER | RED | IMMINENT (operational, not diagnoses)  
- Multi-signal classifier (rules + model assist; not keywords alone)  
- Structured output: `{ state, confidence, signals, recommended_action, policy_version }`  
- Crisis UX deterministic from state; IMMINENT → safety UI, not chat  
- Resources from verified registry only (Tele-MANAS etc. in DB, not prompts)  
- Never fabricate “I called your counsellor / parents / police”

---

## 9. API architecture

- Zod-validated Server Actions for mutations  
- Route Handlers for streaming chat, webhooks, CSV upload  
- Typed DTOs; strip sensitive fields  
- Rate limits: per-user + per-institution AI quotas  
- Idempotent appointment booking; DB constraints against double-book  

---

## 10. Frontend architecture

- Route groups per audience; shared design system  
- Student: mobile-first, calm, primary CTA “Talk to ManoYug AI” + “Talk to a human”  
- Counsellor: case queue density  
- Institution: operational analytics (no private chats by default)  
- Super admin: tenants, AI cost, safety, governance  
- Every interactive path: loading / empty / error / success / retry  

---

## 11. Analytics architecture

- First-party `analytics_events` only for product metrics  
- No raw chat content in generic analytics  
- Aggregate institution dashboards with **minimum cohort threshold**  
- Label STUDENT-REPORTED vs AI-INFERRED  

---

## 12. Observability architecture

- Structured app logs (no unnecessary conversation dumps)  
- AI latency / error / token metrics  
- Error monitoring (e.g. Sentry) when keys available  
- Health endpoints for staging/prod  

---

## 13. Security architecture

- RLS + RBAC + server authz  
- Secure headers, CSRF where applicable, XSS encoding  
- Secrets only in env; `.env.example` documented names only  
- CSV formula injection defense; export escaping  
- Audit log for privileged actions; protect audit table  
- Break-glass: reason, time-limit, audit, review — no silent backdoor  
- Negative tests: cross-tenant, forged JWT claims, unassigned cases  

---

## 14. Testing strategy

| Type | Tool | Focus |
|------|------|--------|
| Unit | Vitest | safety classifier, permissions, CSV parse |
| Integration | Vitest + local Supabase | authz, eligibility, appointments |
| RLS | SQL/pgTAP or integration | tenant isolation |
| E2E | Playwright | register→OTP→chat→escalate→case→CSV |
| AI safety | eval harness | injection, methods, role confusion |
| a11y | axe + manual keyboard | WCAG 2.2 AA practical |

---

## 15. Deployment strategy

- Envs: development / staging / production  
- Vercel + Supabase projects per env  
- Migrations applied in CI before deploy  
- Feature flags for prompt/model/policy rollout  
- Never commit secrets  

---

## 16. Implementation phases

| Phase | Scope | Exit criteria |
|-------|--------|---------------|
| **0** | Audit, plan, design tokens, docs skeleton | This plan + status doc |
| **1** | DB migrations, Auth, tenancy, roles, eligibility | RLS + negative auth tests |
| **2** | Student onboarding, dashboard shell, chat UI | Real OTP + eligibility bind |
| **3** | AI gateway, prompts, RAG, safety engine | Safety outside LLM verified |
| **4** | Counsellor, cases, appointments, escalation | Auditable case transitions |
| **5** | Institution admin, roster CSV, analytics, resources | No private chat leakage |
| **6** | Super admin control center | Cost, safety, prompts, tenants |
| **7** | Security hardening, full test suite, a11y, perf | Critical E2E + RLS green |
| **8** | Monitoring, deploy docs, production readiness | Staging sign-off |

---

## 17. Dependencies (initial)

**Runtime:** next, react, @supabase/supabase-js, @supabase/ssr, zod, next-intl, @google/generative-ai (or fetch wrapper); OTP delivery via Supabase custom SMTP and ZeptoMail

**UI:** tailwindcss, class-variance-authority, clsx, radix-ui primitives, lucide-react (sparingly)  

**Dev:** typescript, eslint, prettier, vitest, playwright, supabase CLI  

---

## 18. Risks

| Risk | Mitigation |
|------|------------|
| Safety false negatives | Multi-signal engine + eval gate before prompt deploy |
| Tenant data leak | RLS + server checks + dedicated security tests |
| AI cost blowups | Quotas, circuit breakers, model fallback (never skip safety) |
| Missing API keys | Interfaces + mock providers; document setup |
| Legal/clinical claims | Placeholder legal pages; no invented crisis numbers |
| Scope explosion | Vertical slices; mark [~] until full Definition of Done |

---

## 19. Unresolved decisions (non-blocking)

| Topic | Interim decision | When to revisit |
|-------|------------------|-----------------|
| Exact OTP provider vs Supabase native | Supabase Auth email OTP + ZeptoMail SMTP | If deliverability fails, inspect ZeptoMail/Supabase delivery logs |
| Worker/queue (Inngest vs cron) | Start with Vercel cron + DB jobs | When async volume grows |
| Embedding store for RAG | pgvector on Supabase | After knowledge volume > trivial |
| MFA vendor | Supabase TOTP | Before production staff rollout |
| Full legal copy | Counsel-reviewed placeholders | Pre-launch |
| Master blueprint v2.0 external file | Not in repo; use `blueprint.md` | If user adds file, reconcile overrides |

---

## 20. Immediate next actions

1. Create `docs/PROJECT_STATUS.md` (living handoff)  
2. Scaffold Next.js + Tailwind + TypeScript  
3. Add `.env.example`, design tokens, docs stubs  
4. Author initial Supabase migrations (tenancy + auth-linked tables)  
5. Implement auth middleware + permission helpers  
6. Eligibility + registration vertical slice  

---

*This plan is the engineering source of truth until superseded by an explicit plan revision in git.*
