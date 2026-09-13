-- ManoYug AI — Institute Code, Multi-Tenant RBAC & Password Credentials Migration
-- Migration 20260910000000

-- 1. Add institute code, active status, admin email and password credentials to institutions
alter table public.institutions
  add column if not exists code text unique,
  add column if not exists is_code_active boolean not null default true,
  add column if not exists admin_email text,
  add column if not exists password_hash text;

create index if not exists institutions_code_idx on public.institutions (upper(code));
create index if not exists institutions_admin_email_idx on public.institutions (lower(admin_email));

-- 2. Seed unique institute codes for existing/demo institutions
update public.institutions
set
  code = 'MANOYUG-IITD-001',
  admin_email = 'admin@iitd.ac.in',
  is_code_active = true
where slug = 'iit-delhi-demo' or id = '00000000-0000-4000-8000-000000000001';

-- Insert standard demo institutions if not present
insert into public.institutions (id, name, slug, code, is_code_active, admin_email, student_capacity, status)
values
  ('00000000-0000-4000-8000-000000000002', 'Delhi University (North Campus)', 'delhi-university', 'MANOYUG-DU-001', true, 'admin@du.ac.in', 8000, 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000003', 'Maharshi Dayanand University', 'mdu-rohtak', 'MANOYUG-MDU-002', true, 'wellness@mdu.ac.in', 6000, 'ACTIVE')
on conflict (slug) do update set
  code = excluded.code,
  is_code_active = excluded.is_code_active,
  admin_email = excluded.admin_email;

-- 3. Seed approved student records for demo validation
insert into public.institution_students (
  institution_id, email, university_roll_no, full_name, graduation_year, department, status
) values
  ('00000000-0000-4000-8000-000000000001', 'student@iitd.ac.in', '2022CS10101', 'Aarav Sharma', 2026, 'Computer Science', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000001', 'priya.singh@iitd.ac.in', '2023EE10204', 'Priya Singh', 2027, 'Electrical Engineering', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000002', 'student@du.ac.in', 'DU-2022-8819', 'Rohan Verma', 2025, 'Psychology', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000003', 'student@mdu.ac.in', 'MDU-CS-409', 'Ananya Gupta', 2026, 'Computer Applications', 'ACTIVE')
on conflict (institution_id, email) do nothing;

-- 4. RLS Policy for Public / Registration Institute Code lookup (code + status only)
create or replace function public.is_institute_code_valid(p_code text)
returns table (institution_id uuid, name text, is_active boolean)
language sql
stable
security definer
set search_path = public
as $$
  select id, name, is_code_active
  from public.institutions
  where upper(code) = upper(trim(p_code))
    and status = 'ACTIVE'
    and is_code_active = true
  limit 1;
$$;
