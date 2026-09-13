-- DEV-labelled seed tenant for local/staging. Never treat as production customers.
-- Idempotent-ish via fixed UUID.

insert into public.institutions (
  id, name, slug, status, student_capacity, academic_year, branding, privacy_config
) values (
  '00000000-0000-4000-8000-000000000001',
  'Demo University (DEV SEED)',
  'demo-university',
  'ACTIVE',
  5000,
  '2026-27',
  '{"label":"DEV"}'::jsonb,
  '{"min_cohort":10}'::jsonb
)
on conflict (id) do update
  set name = excluded.name,
      status = excluded.status,
      updated_at = now();

insert into public.institution_students (
  institution_id, email, phone, full_name, university_roll_no, graduation_year,
  department, programme, batch, status
) values (
  '00000000-0000-4000-8000-000000000001',
  'demo.student@demo-university.example',
  '9876543210',
  'Demo Student',
  'DEMO/2026/001',
  2027,
  'Computer Science',
  'B.Tech',
  '2026',
  'ACTIVE'
)
on conflict (institution_id, email) do nothing;
