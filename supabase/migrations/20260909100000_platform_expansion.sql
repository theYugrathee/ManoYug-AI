-- ManoYug AI — Platform Expansion Migration
-- Adds Institution Requests, Pricing Plans, Feature Flags, Institution Support Contacts, and AI Usage tracking

-- 1. Institution Registration Requests (Onboarding queue for Super Admin review)
create type public.institution_request_status as enum (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'NEEDS_INFO'
);

create table if not exists public.institution_requests (
  id uuid primary key default gen_random_uuid(),
  institution_name text not null,
  official_email text not null,
  contact_phone text not null,
  institution_type text not null,
  approximate_student_count integer not null default 1000,
  city text not null,
  state text not null,
  website text,
  contact_person_name text not null,
  contact_person_designation text not null,
  status public.institution_request_status not null default 'PENDING',
  notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists institution_requests_status_idx on public.institution_requests (status);
create index if not exists institution_requests_created_idx on public.institution_requests (created_at desc);

-- 2. Pricing Plans (Configurable annual student tiers)
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  student_capacity integer not null check (student_capacity > 0),
  annual_price_inr numeric(12,2) not null check (annual_price_inr >= 0),
  description text,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed standard tiers
insert into public.pricing_plans (name, slug, student_capacity, annual_price_inr, description, features, is_active)
values
  ('Campus Starter', 'starter-2500', 2500, 450000, 'For smaller colleges and standalone departments', '["Up to 2,500 students", "Full AI Companion & Safety Engine", "Aggregate Wellbeing Analytics", "CSV Roster Sync"]'::jsonb, true),
  ('Standard University', 'standard-5000', 5000, 900000, 'For medium universities and multi-department colleges', '["Up to 5,000 students", "Full AI Companion & Safety Engine", "Advanced Wellbeing Trends", "Priority Tele-MANAS escalation", "Dedicated Support Configuration"]'::jsonb, true),
  ('Enterprise / Large Campus', 'enterprise-15000', 15000, 2400000, 'For comprehensive multi-campus universities', '["Up to 15,000 students", "Full AI Companion & Safety Engine", "Custom Campus Resources", "SLA & High Concurrency", "Multi-department isolation"]'::jsonb, true)
on conflict (slug) do nothing;

-- 3. Feature Flags (Runtime switches managed by Super Admin)
create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  is_enabled boolean not null default false,
  environment text not null default 'all',
  target_roles jsonb not null default '["STUDENT", "INSTITUTION_ADMIN", "PLATFORM_SUPER_ADMIN"]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (key, name, description, is_enabled)
values
  ('chat_streaming', 'AI Chat Streaming', 'Stream responses token by token for ultra-responsive student chat', true),
  ('advanced_wellbeing_analytics', 'Advanced Wellbeing Trends', 'Deep cohort analysis and seasonal stress spike tracking', true),
  ('multilingual_hinglish', 'Hinglish & Regional Support', 'Culturally natural responses for Indian student idioms', true),
  ('tele_manas_direct_action', 'Direct Tele-MANAS Bridge', 'Direct verified one-touch calling for Tele-MANAS hotline', true)
on conflict (key) do nothing;

-- 4. Institution Support Contacts (Configurable campus contacts)
create table if not exists public.institution_support_contacts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  title text not null,
  contact_type text not null,
  phone text,
  email text,
  location text,
  operating_hours text,
  is_emergency boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists institution_support_contacts_idx on public.institution_support_contacts (institution_id);

-- 5. AI Usage Tracking (Cost, token count, and latency tracking)
create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null,
  model text not null,
  purpose text not null default 'conversation',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  latency_ms integer not null default 0,
  estimated_cost_usd numeric(8,6) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_logs_institution_idx on public.ai_usage_logs (institution_id, created_at desc);
create index if not exists ai_usage_logs_created_idx on public.ai_usage_logs (created_at desc);

-- RLS
alter table public.institution_requests enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.feature_flags enable row level security;
alter table public.institution_support_contacts enable row level security;
alter table public.ai_usage_logs enable row level security;

-- Public can submit institution requests
create policy institution_requests_insert_public on public.institution_requests
  for insert with check (true);

-- Platform admins can read/update all requests
create policy institution_requests_select_platform on public.institution_requests
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.is_active = true
        and m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPPORT')
    )
  );

create policy institution_requests_update_platform on public.institution_requests
  for update using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.is_active = true
        and m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN')
    )
  );

-- Pricing plans: readable by all, editable by Super Admin
create policy pricing_plans_select_all on public.pricing_plans
  for select using (is_active = true or exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid() and m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN')
  ));

-- Feature flags: readable by authenticated users, editable by Super Admin
create policy feature_flags_select_all on public.feature_flags
  for select using (true);

-- Support contacts: members of institution can read
create policy institution_support_contacts_select on public.institution_support_contacts
  for select using (public.has_institution_membership(institution_id));

-- Support contacts: institution admin can manage
create policy institution_support_contacts_admin on public.institution_support_contacts
  for all using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.institution_id = institution_support_contacts.institution_id
        and m.is_active = true
        and m.role in ('INSTITUTION_ADMIN', 'INSTITUTION_SUPER_ADMIN', 'PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN')
    )
  );
