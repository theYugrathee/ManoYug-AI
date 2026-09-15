# ManoYug AI

**A privacy-first wellbeing companion and support infrastructure for colleges and universities.**

ManoYug AI helps students find a practical next step when academic pressure, loneliness, homesickness, ragging, uncertainty, or emotional distress becomes difficult to manage. Institutions get an always-available first-line support layer without making private student conversations part of ordinary administration.

> ManoYug AI is not a therapist, psychologist, psychiatrist, doctor, emergency service, or replacement for human care. For immediate danger in India, call **112**. For mental-health support, call **Tele-MANAS: 14416 / 1800-89-14416**.

## What it is

ManoYug AI is a B2B institutional SaaS platform with three controlled experiences:

1. **Student workspace** — AI companion, check-ins, grounding exercises, verified resources, human-support requests, appointments, conversation history, timeline, privacy settings, and safety help.
2. **Institution workspace** — eligibility roster management, campus contacts, verified resources, aggregate wellbeing trends, reports, student support requests, and operational safety alerts.
3. **Super-admin workspace** — institution requests, tenant operations, pricing, feature flags, AI usage, evaluations, security controls, and governance tools.

Every institution is a separate tenant. A student can register only when an active institute code matches an approved student email in that institute's eligibility list. A valid code alone is never sufficient.

## Why it exists

Students may need support outside office hours, before they are ready to approach a person, or while they are unsure what kind of help they need. Institutions need to respond quickly without turning wellbeing into surveillance. ManoYug AI bridges that gap: it helps a student find the next safe, human-connected step while preserving dignity and privacy.

It is a first-line companion and operational bridge, not a replacement for a counselling team.

## Who it helps

### Students

- Talk with an AI companion in English, Hindi, or Hinglish.
- Reflect through optional daily or weekly check-ins.
- Use short, non-clinical grounding exercises.
- Find verified national and campus resources.
- Request human support from the institute and book appointments where enabled.
- Review personal activity and privacy controls.
- Receive deterministic crisis guidance when a high-risk signal is detected.

### Institutions

- Control eligibility through an email-first roster and CSV import.
- Deactivate or reactivate students.
- Publish campus contacts and verified resources.
- Receive callback requests in an authenticated inbox.
- Review high-risk alerts with the student's email for prompt human follow-up.
- View privacy-preserving aggregate trends and reports.

## How it works

```text
Request → authentication and tenant context
        → server-side permission/eligibility checks
        → application workflow
        → Supabase persistence and audit trail
        → role-specific UI and next action
```

For a chat message:

```text
Auth → tenant check → rate limit → safety precheck
     → approved context → model gateway → safety postcheck
     → action router → response/UI → durable persistence
```

The model generates language. The application decides safety state, crisis UI, tenant access, and whether an operational event is recorded.

## Product areas

### Student workspace

| Area | Purpose |
|---|---|
| AI Companion | Private first-line conversation and practical next steps |
| Past Conversations | Review conversations owned by the student |
| Daily Check-in | Optional mood, stress, energy, sleep, academic-pressure, and social-connection reflection |
| Grounding Exercises | Short breathing, sensory, and routine exercises |
| Support & Resources | Campus directory, national resources, emergency help, and callback request |
| Appointments | Support appointment workflow when enabled |
| Activity Timeline | Student-owned activity and request history |
| Profile & Privacy | Preferences and data controls |
| Safety & Helpline | Immediate-help guidance |

`/student/resources` remains available for old bookmarks, while primary navigation uses `/student/support`.

### Institution workspace

| Area | Purpose |
|---|---|
| Executive Overview | Eligible students, activation, check-ins, aggregate themes, and safety counts |
| Add / Remove Students | Email-first eligibility roster and CSV import |
| Campus Support Contacts | Configure verified campus routes |
| Student Support & Safety | Callback inbox and high-risk alerts |
| Analytics | Cohort-level wellbeing themes |
| Verified Resources | Institution-managed resources |
| Compliance & Exports | CSV and print/report workflows |

The support inbox shows authorised staff the callback note, student email, and safety metadata. It does not show private chat text.

### Super-admin workspace

The `/super-admin` routes cover institution requests, tenants, pricing, feature flags, AI usage, evaluations, security, retention, and platform-only administration. This is a restricted operational surface, not a normal student navigation item.

## Student and institution flows

### Student registration

1. An institution adds the student's email to its approved eligibility list.
2. The student enters an active institute code, email, name, phone, graduation year, optional roll number, and password.
3. Server-side checks match the exact active institution and approved email. Frontend state, URL changes, or forged payloads cannot bypass this.
4. Supabase Auth, profile, membership, student profile, and roster link are reconciled.
5. Email verification is completed through Supabase Auth.

Repeated registration returns an account-exists/sign-in path. Roll number is optional; email is the required eligibility match.

### Institution onboarding

1. An institution submits a join request with organisation, contact, location, and requirements.
2. A new Supabase request row is created with a unique ID, timestamp, and pending status.
3. A super administrator reviews the real request.
4. Approval creates a new institution and code linked to the original request.
5. The institution configures contacts and uploads the approved email roster.
6. Support requests and RED/IMMINENT safety events appear in the protected institution inbox.

## AI architecture

The AI provider is behind an application gateway. Gemini is the initial production provider; a labelled mock provider enables local development without an API key.

### The AI can

- provide reflective questions, psychoeducation, grounding ideas, and practical next steps;
- support English, Hindi, and Hinglish contexts;
- use approved application knowledge and verified resource data;
- offer human support when requested;
- identify itself clearly as AI.

### The AI cannot

- diagnose, prescribe, or provide emergency care;
- replace a clinician, counsellor, trusted person, or responder;
- claim it called someone or made a referral unless a real integration succeeded;
- reveal another student's data;
- override application safety decisions;
- invent crisis numbers, campus contacts, or institutional policy.

`AI_PROVIDER=auto` selects Gemini when configured and otherwise uses the labelled mock provider.

## Safety and crisis handling

Safety exists outside the LLM. These are operational states, not clinical diagnoses:

| State | Meaning | Typical response |
|---|---|---|
| GREEN | General wellbeing | Normal companion flow |
| AMBER | Elevated concern | Calm support banner and human-resource options |
| RED | Acute distress/high-risk signal | De-escalation, verified resources, operational escalation |
| IMMINENT | Immediate danger/active crisis | Normal chat interrupted by deterministic crisis guidance |

The pipeline is: multilingual/contextual deterministic precheck → optional structured semantic layer → constrained generation → unsafe-output postcheck → action router → durable safety event/case persistence.

RED and IMMINENT events appear in the relevant institution inbox with the student's email, state, timestamp, and an instruction to contact the student through the approved campus process. Private conversation content is not displayed.

Verified India-focused resources include **112** for immediate emergency response and **Tele-MANAS 14416 / 1800-89-14416** for mental-health support. The model never invents numbers. No automated classifier understands every indirect, coded, local-language, sarcastic, or changing situation; anyone who feels unsafe should contact a trusted person or emergency service even if the app does not show a safety state.

## Privacy and security

Server-side sessions, role checks, tenant-scoped queries, and Supabase Row-Level Security work together. Institution A must not read Institution B, and a valid code must not create unapproved membership.

Institution administrators do not receive private student chat transcripts by default. They receive only approved workflow information: roster records, callback requests, aggregate analytics, and high-risk safety alerts. Ordinary reports do not export private conversations.

Depending on enabled workflows, the platform may store identity/eligibility details, conversations, optional check-ins, exercise events, support requests, appointments, feedback, deletion requests, safety events, resources, contacts, audit logs, and aggregate operational data.

Repository controls include Supabase Auth, a server-only service-role client, RLS, tenant-scoped server actions, protected role layouts, audit logging, chat rate limiting, security headers, no committed secrets, and static-only PWA caching that excludes chat/API routes.

Before production, configure backups, retention, monitoring, incident response, MFA, and shared rate limiting. Complete independent security, privacy, legal, and clinical-safety reviews.

## Pricing

The schedule is defined in [`src/lib/commercial/pricing.ts`](src/lib/commercial/pricing.ts) and shown at `/pricing`. Rates are annual INR estimates before applicable GST and must be confirmed in a signed institutional order form.

| Maximum student capacity | Annual license (INR) |
|---:|---:|
| 5,000 | ₹4,00,000 |
| 10,000 | ₹8,00,000 |
| 15,000 | ₹12,00,000 |
| 20,000 | ₹16,00,000 |
| 25,000 | ₹20,00,000 |
| 50,000 | ₹40,00,000 |
| 100,000 | ₹80,00,000 |

Core companion, safety stack, resources, roster workflows, analytics, and role-based access are intended to be included in each tier. Support SLAs, onboarding, taxes, renewals, and enterprise terms depend on the signed agreement.

## Terms and responsible use

The canonical public legal pages are `/terms`, `/privacy`, `/safety`, and `/ai-disclosure`; the signed institutional agreement controls commercial use. This README is not a contract.

Users must provide accurate information, protect credentials, use the service lawfully, and not bypass eligibility, tenant isolation, rate limits, or safety controls. AI output must not be treated as medical, legal, or emergency advice. Institutions are responsible for accurate rosters, campus contacts, escalation procedures, staff training, and human follow-up. ManoYug AI must not be the only safety response available to students.

## Technology and local setup

| Layer | Technology |
|---|---|
| Web | Next.js App Router 16, React 19, TypeScript |
| UI | Tailwind CSS 4, design tokens, responsive motion/canvas components |
| Auth/data | Supabase Auth, PostgreSQL, migrations, RLS |
| AI | Gateway with Gemini and labelled mock provider |
| Email | Supabase Auth custom SMTP through ZeptoMail for OTP delivery |
| Validation | Zod and server-side authorization |
| Tests | Vitest and Playwright |
| Deployment | Vercel-compatible Next.js host plus Supabase |

Requirements: Node.js compatible with this Next.js version and pnpm 10.x.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase, public pages and a labelled in-memory development store can run, but memory data resets after a server restart and is not production persistence.

```bash
pnpm build
pnpm start
```

## Environment variables

Copy `.env.example` to `.env.local`; never commit `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
GEMINI_API_KEY=your-gemini-key
AI_PROVIDER=auto
EMAIL_PROVIDER=auto
```

The service-role key must remain server-only and must never be imported into client code or committed to GitHub. OTP delivery is configured in Supabase Auth using ZeptoMail custom SMTP; it is not sent by the app's optional transactional provider abstraction.

## Supabase deployment

Apply every file in `supabase/migrations/` to the same project, in filename order. Do not apply only the latest migration to a blank project. Recent migrations add durable support requests, feedback, deletion requests, super-admin governance, institution-request provisioning, and email-first student eligibility with optional roll number. Configure ZeptoMail as Supabase Auth's custom SMTP provider for production OTP delivery.

After migration, verify institution requests, approval, roster registration, rejection of outside students, check-ins, exercises, support requests, appointments, feedback, deletion, safety inbox events, and cross-tenant isolation.

For the trigger error caused by copying `FOR EACH ROW` alone or HTML entities into SQL, run the complete statement:

```sql
drop trigger if exists data_deletion_requests_updated_at on public.data_deletion_requests;
create trigger data_deletion_requests_updated_at
  before update on public.data_deletion_requests
  for each row execute function public.set_updated_at();
```

## Testing

```bash
pnpm test
pnpm test:e2e
pnpm lint
pnpm build
```

Focused checks:

```bash
pnpm vitest run tests/unit/auth-eligibility.test.ts
pnpm vitest run tests/unit/authz-negatives.test.ts
pnpm vitest run tests/unit/permissions-safety.test.ts
```

Tests cover eligibility, tenant boundaries, forged identifiers, role restrictions, persistence workflows, multilingual safety signals, and unsafe assistant output.

## Project structure

```text
src/app/                 Next.js routes and dashboards
src/components/          UI, landing, auth, safety, student, institution
src/lib/ai/              Gateway, prompts, knowledge, usage
src/lib/auth/            Auth, sessions, eligibility, permissions
src/lib/data/            Supabase-backed repositories
src/lib/safety/          Precheck, semantic layer, postcheck, routing
src/lib/providers/       AI, email, analytics, storage abstractions
src/lib/store/           Labelled development memory store
supabase/migrations/     Ordered PostgreSQL schema, RLS, triggers
tests/unit/              Domain, safety, authorization, persistence tests
tests/e2e/               Browser smoke tests
docs/                    Architecture, safety, security, deployment guides
```

## Limitations and roadmap

Before a public production launch, apply and verify migrations, complete DPDP/legal/consent review, validate helplines and campus contacts, configure outbound email if required, replace in-process rate limits, test OTP/MFA/password recovery/deletion end to end, complete security and clinical-safety review, and define staffed escalation SLAs, backups, retention, and disaster recovery.

Planned improvements include distributed rate limiting, institution-configurable on-call routing, verified email/SMS delivery, richer counsellor case management, expanded language coverage, accessibility hardening, CI safety regression gates, formal retention automation, and deeper institution integrations.

## Contributing

Read [`AGENTS.md`](AGENTS.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/SAFETY.md`](docs/SAFETY.md), and [`docs/SECURITY.md`](docs/SECURITY.md). Preserve server-side authorization and tenant boundaries. Never add secrets, fake production success, invented helpline numbers, or private-chat exposure. Add tests and migrations for data-model changes, then run type checks, tests, lint, and a production build.

## Support

For product or partnership questions, use `/contact` or `/institutions`. For deployment questions, start with [`docs/SUPABASE_DEPLOYMENT.md`](docs/SUPABASE_DEPLOYMENT.md). For an immediate personal safety concern, contact a trusted person, campus emergency contact, local emergency services, or Tele-MANAS at **14416** instead of waiting for repository support.

---

ManoYug AI is built around a simple promise: make the next safe, human-connected step easier to find while respecting the student's dignity and privacy.
