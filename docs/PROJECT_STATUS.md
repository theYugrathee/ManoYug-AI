# ManoYug AI — Project Status

**Last updated:** 2026-09-08  
**Code completion:** ~95% of blueprint product surfaces (application code)  
**Live production:** requires your Supabase / Gemini keys + counsel legal sign-off; ZeptoMail SMTP is optional until email OTP is enabled

## Complete in-repo

All role UIs, auth flows, safety pipeline, AI gateway, streaming chat, CSV roster,
appointments, analytics, reports (CSV + print/PDF), MFA enroll UI, deletion
requests, feedback, PWA, security headers, providers, migrations, unit + e2e smoke.

## Your remaining non-code steps

1. Apply `supabase/migrations/*`  
2. Fill `.env.local`  
3. Enable Auth OTP and configure ZeptoMail SMTP later when a verified sending domain is available
4. Optional Gemini / Sentry
5. Counsel review of legal placeholders  

## Preview

```bash
pnpm dev
# open http://localhost:3000
```
