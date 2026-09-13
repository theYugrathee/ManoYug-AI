# ManoYug AI — Security

## Principles

- Never trust frontend role / institution_id / hidden fields
- Derive authorization server-side from session + memberships
- RLS on Postgres is defense in depth
- Audit privileged actions

## Headers

`next.config.ts` sets CSP, `X-Frame-Options`, `nosniff`, referrer, and permissions policies.

## Rate limits

In-process fixed windows on chat (`src/lib/security/rate-limit.ts`). Replace with Redis for multi-instance.

## Audit

`writeAuditLog` → `audit_logs` when service role is present; structured console fallback otherwise. Never log raw chat bodies.

## MFA

Policy documented at `/super-admin/security`. Enforce with Supabase Auth MFA for elevated roles after credentials are connected.

## PWA

Service worker caches **static** assets only — never `/api/*` or chat routes.
