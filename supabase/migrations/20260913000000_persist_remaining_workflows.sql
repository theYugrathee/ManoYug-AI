-- Durable storage for workflows that previously existed only in the Node process.
-- All privileged writes are performed by authenticated server actions; RLS remains enabled.

-- This makes the migration safe to run in a project that did not apply the
-- original tenancy migration's helper function first.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Earlier releases used a compact institution_requests shape. Keep it
-- backwards-compatible while making all form fields durable.
alter table public.institution_requests
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists website text,
  add column if not exists contact_person_name text,
  add column if not exists contact_person_designation text;

create table if not exists public.student_support_requests (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  student_user_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  status text not null default 'NEW' check (status in ('NEW', 'ACKNOWLEDGED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_support_requests_institution_idx
  on public.student_support_requests (institution_id, created_at desc);

create table if not exists public.message_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  rating text not null check (rating in ('up', 'down', 'report')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'RECEIVED' check (status in ('RECEIVED', 'IN_REVIEW', 'COMPLETED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_support_requests enable row level security;
alter table public.message_feedback enable row level security;
alter table public.data_deletion_requests enable row level security;

drop policy if exists student_support_requests_own on public.student_support_requests;
create policy student_support_requests_own on public.student_support_requests
  for select using (student_user_id = auth.uid());

drop policy if exists message_feedback_own on public.message_feedback;
create policy message_feedback_own on public.message_feedback
  for select using (user_id = auth.uid());

drop policy if exists data_deletion_requests_own on public.data_deletion_requests;
create policy data_deletion_requests_own on public.data_deletion_requests
  for select using (user_id = auth.uid());

-- Platform roles can review operational requests but never private message content.
drop policy if exists data_deletion_requests_platform on public.data_deletion_requests;
create policy data_deletion_requests_platform on public.data_deletion_requests
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid() and m.is_active = true
        and m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPPORT')
    )
  );

drop trigger if exists student_support_requests_updated_at on public.student_support_requests;
create trigger student_support_requests_updated_at
  before update on public.student_support_requests
  for each row execute function public.set_updated_at();

drop trigger if exists data_deletion_requests_updated_at on public.data_deletion_requests;
create trigger data_deletion_requests_updated_at
  before update on public.data_deletion_requests
  for each row execute function public.set_updated_at();

-- Runtime controls use the stable keys the application checks. Existing
-- underscore-named flags remain available for backwards-compatible admin UI.
insert into public.feature_flags (key, name, description, is_enabled)
values
  ('chat.enabled', 'Student companion chat', 'Allow students to start new companion chat turns.', true),
  ('chat.streaming', 'Streaming companion chat', 'Stream companion replies token by token.', true),
  ('gemini.enabled', 'Gemini provider', 'Allow the Gemini provider to be selected for inference.', true),
  ('roster.csv_import', 'Roster CSV import', 'Allow institution administrators to import roster CSV files.', true),
  ('appointments.enabled', 'Appointments', 'Allow students to book campus support appointments.', true),
  ('analytics.dashboard', 'Institution analytics', 'Show cohort analytics to institution administrators.', true),
  ('eval.suite', 'Evaluation suite', 'Show the platform evaluation console.', true),
  ('break_glass.enabled', 'Break-glass access', 'Allow emergency platform access controls.', false)
on conflict (key) do nothing;
