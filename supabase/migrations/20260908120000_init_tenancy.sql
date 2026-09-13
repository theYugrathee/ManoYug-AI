-- ManoYug AI — initial tenancy, identity, eligibility, audit
-- Phase 1 foundation. Expand in later migrations; never hand-edit prod.

create extension if not exists "pgcrypto";

-- Enums
create type public.app_role as enum (
  'STUDENT',
  'COUNSELLOR',
  'COUNSELLOR_SUPERVISOR',
  'INSTITUTION_ADMIN',
  'INSTITUTION_SUPER_ADMIN',
  'PLATFORM_SUPPORT',
  'PLATFORM_ADMIN',
  'PLATFORM_SUPER_ADMIN',
  'CLINICAL_REVIEWER',
  'FINANCE'
);

create type public.roster_status as enum ('ACTIVE', 'INACTIVE', 'PENDING');
create type public.institution_status as enum ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
create type public.safety_state as enum ('GREEN', 'AMBER', 'RED', 'IMMINENT');

-- Institutions (tenants)
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status public.institution_status not null default 'ACTIVE',
  student_capacity integer not null default 5000 check (student_capacity > 0),
  academic_year text,
  logo_url text,
  branding jsonb not null default '{}'::jsonb,
  privacy_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profiles linked to auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Memberships: user ↔ institution ↔ role
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, institution_id, role)
);

create index memberships_institution_idx on public.memberships (institution_id);
create index memberships_user_idx on public.memberships (user_id);

-- Eligibility roster (institution-managed; no passwords here)
create table public.institution_students (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  email text not null,
  phone text,
  full_name text,
  university_roll_no text not null,
  graduation_year integer,
  department text,
  programme text,
  batch text,
  status public.roster_status not null default 'ACTIVE',
  linked_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, email),
  unique (institution_id, university_roll_no)
);

create index institution_students_institution_idx
  on public.institution_students (institution_id);
create index institution_students_email_idx
  on public.institution_students (lower(email));

-- Student profile extras
create table public.student_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  graduation_year integer,
  university_roll_no text,
  preferences jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Verified resource registry (crisis numbers live here — not in prompts)
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions (id) on delete cascade,
  name text not null,
  resource_type text not null,
  contact_value text not null,
  region text,
  owner text,
  source text,
  verified_at timestamptz,
  review_by timestamptz,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resources_institution_idx on public.resources (institution_id);

-- Audit log (privileged actions)
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  role public.app_role,
  institution_id uuid references public.institutions (id),
  action text not null,
  resource text,
  resource_id text,
  result text,
  metadata jsonb not null default '{}'::jsonb,
  ip_metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_institution_idx on public.audit_logs (institution_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- Analytics events (privacy-conscious; no raw chat content)
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions (id),
  user_id uuid references public.profiles (id),
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_name_idx on public.analytics_events (event_name);
create index analytics_events_institution_idx on public.analytics_events (institution_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger institutions_updated_at
  before update on public.institutions
  for each row execute function public.set_updated_at();

create trigger institution_students_updated_at
  before update on public.institution_students
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger student_profiles_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

create trigger resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- RLS
alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.institution_students enable row level security;
alter table public.student_profiles enable row level security;
alter table public.resources enable row level security;
alter table public.audit_logs enable row level security;
alter table public.analytics_events enable row level security;

-- Helper: active membership for current user at institution
create or replace function public.has_institution_membership(p_institution_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = auth.uid()
      and m.institution_id = p_institution_id
      and m.is_active = true
  );
$$;

-- Profiles: users read/update self
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());

-- Memberships: user can see own memberships
create policy memberships_select_own on public.memberships
  for select using (user_id = auth.uid());

-- Institutions: members can read their institution
create policy institutions_select_member on public.institutions
  for select using (public.has_institution_membership(id));

-- Roster: only institution admins via membership role (server still re-checks)
create policy institution_students_select_admin on public.institution_students
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.institution_id = institution_students.institution_id
        and m.is_active = true
        and m.role in ('INSTITUTION_ADMIN', 'INSTITUTION_SUPER_ADMIN', 'PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN')
    )
  );

-- Students read own student_profile
create policy student_profiles_select_own on public.student_profiles
  for select using (user_id = auth.uid());

create policy student_profiles_update_own on public.student_profiles
  for update using (user_id = auth.uid());

-- Resources: members of institution OR global (null institution_id)
create policy resources_select_visible on public.resources
  for select using (
    institution_id is null
    or public.has_institution_membership(institution_id)
  );

-- Audit: platform roles only (tighten further in app layer)
create policy audit_logs_select_platform on public.audit_logs
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.is_active = true
        and m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPPORT')
    )
  );

-- Seed global Tele-MANAS style resources (verified registry — review dates required)
insert into public.resources (
  institution_id, name, resource_type, contact_value, region, owner, source, verified_at, review_by, status
) values
  (null, 'Tele-MANAS', 'national_mental_health_helpline', '14416', 'IN', 'platform', 'official', now(), now() + interval '180 days', 'ACTIVE'),
  (null, 'Tele-MANAS (toll-free)', 'national_mental_health_helpline', '1800-89-14416', 'IN', 'platform', 'official', now(), now() + interval '180 days', 'ACTIVE');
