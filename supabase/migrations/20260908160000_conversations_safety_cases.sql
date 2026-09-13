-- Conversations, safety events, wellbeing, cases, appointments, prompts
-- Phase 2–4 foundation. Apply after auth profile trigger migration.

-- Conversations & messages
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  language text not null default 'en',
  latest_safety_state public.safety_state not null default 'GREEN',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_student_idx on public.conversations (student_user_id);
create index conversations_institution_idx on public.conversations (institution_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  safety_state public.safety_state,
  safety_policy_version text,
  blocked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

create table public.safety_events (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  user_id uuid references public.profiles (id),
  conversation_id uuid references public.conversations (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  state public.safety_state not null,
  confidence numeric(4,3),
  signals jsonb not null default '[]'::jsonb,
  recommended_action text not null,
  policy_version text not null,
  source text not null default 'precheck',
  created_at timestamptz not null default now()
);

create index safety_events_institution_idx on public.safety_events (institution_id, created_at desc);

-- Check-ins (non-diagnostic)
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  period text not null check (period in ('daily', 'weekly')),
  mood smallint check (mood between 1 and 5),
  stress smallint check (stress between 1 and 5),
  energy smallint check (energy between 1 and 5),
  sleep smallint check (sleep between 1 and 5),
  academic_pressure smallint check (academic_pressure between 1 and 5),
  social_connection smallint check (social_connection between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

create index checkins_user_idx on public.checkins (user_id, created_at desc);

-- Guided exercises (versioned catalogue)
create table public.guided_exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  duration_minutes integer not null default 5,
  steps jsonb not null default '[]'::jsonb,
  language text not null default 'en',
  clinical_approval_status text not null default 'DRAFT',
  version text not null default '1.0.0',
  evidence_notes text,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercise_completions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid not null references public.guided_exercises (id) on delete cascade,
  completed_at timestamptz not null default now()
);

-- Cases (counsellor workflow)
create type public.case_status as enum (
  'NEW',
  'ACKNOWLEDGED',
  'CONTACTING',
  'CONTACTED',
  'APPOINTMENT_SCHEDULED',
  'REFERRED',
  'MONITORING',
  'RESOLVED',
  'UNABLE_TO_REACH',
  'CLOSED'
);

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  assigned_counsellor_id uuid references public.profiles (id),
  conversation_id uuid references public.conversations (id) on delete set null,
  status public.case_status not null default 'NEW',
  risk_state public.safety_state not null default 'AMBER',
  source text not null default 'student_request',
  ai_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cases_institution_status_idx on public.cases (institution_id, status);
create index cases_counsellor_idx on public.cases (assigned_counsellor_id);

create table public.counsellor_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Appointments (btree_gist for overlap exclusion)
create extension if not exists btree_gist;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  counsellor_user_id uuid not null references public.profiles (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'SCHEDULED',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_time_ok check (ends_at > starts_at),
  constraint appointments_no_overlap exclude using gist (
    counsellor_user_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status = 'SCHEDULED')
);

-- Prompt registry
create type public.prompt_status as enum (
  'DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'ROLLED_BACK', 'ARCHIVED'
);

create table public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  environment text not null default 'development',
  status public.prompt_status not null default 'DRAFT',
  content text not null,
  created_by uuid references public.profiles (id),
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  deployment_date timestamptz,
  rollback_version text,
  created_at timestamptz not null default now(),
  unique (name, version, environment)
);

create table public.model_configs (
  id uuid primary key default gen_random_uuid(),
  purpose text not null,
  provider text not null,
  model text not null,
  max_tokens integer,
  temperature numeric(3,2),
  cost_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE',
  version text not null default '1',
  created_at timestamptz not null default now()
);

-- updated_at triggers
create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create trigger cases_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

create trigger guided_exercises_updated_at
  before update on public.guided_exercises
  for each row execute function public.set_updated_at();

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create trigger counsellor_notes_updated_at
  before update on public.counsellor_notes
  for each row execute function public.set_updated_at();

-- RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.safety_events enable row level security;
alter table public.checkins enable row level security;
alter table public.guided_exercises enable row level security;
alter table public.exercise_completions enable row level security;
alter table public.cases enable row level security;
alter table public.counsellor_notes enable row level security;
alter table public.appointments enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.model_configs enable row level security;

-- Students: own conversations/messages/checkins
create policy conversations_select_own on public.conversations
  for select using (student_user_id = auth.uid());

create policy conversations_insert_own on public.conversations
  for insert with check (student_user_id = auth.uid());

create policy conversations_update_own on public.conversations
  for update using (student_user_id = auth.uid());

create policy messages_select_own on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.student_user_id = auth.uid()
    )
  );

create policy messages_insert_own on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.student_user_id = auth.uid()
    )
  );

create policy checkins_own on public.checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy guided_exercises_read on public.guided_exercises
  for select using (status = 'ACTIVE');

create policy exercise_completions_own on public.exercise_completions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy appointments_student_own on public.appointments
  for select using (student_user_id = auth.uid());

create policy appointments_student_insert on public.appointments
  for insert with check (student_user_id = auth.uid());

-- Counsellors: assigned cases only (notes never to students)
create policy cases_counsellor_assigned on public.cases
  for select using (
    assigned_counsellor_id = auth.uid()
    or student_user_id = auth.uid()
    or exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.institution_id = cases.institution_id
        and m.is_active = true
        and m.role in ('COUNSELLOR', 'COUNSELLOR_SUPERVISOR', 'INSTITUTION_SUPER_ADMIN', 'PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN')
    )
  );

create policy counsellor_notes_staff_only on public.counsellor_notes
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.institution_id = counsellor_notes.institution_id
        and m.is_active = true
        and m.role in ('COUNSELLOR', 'COUNSELLOR_SUPERVISOR', 'PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN', 'CLINICAL_REVIEWER')
    )
  );

create policy safety_events_staff on public.safety_events
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.institution_id = safety_events.institution_id
        and m.is_active = true
        and m.role in ('COUNSELLOR', 'COUNSELLOR_SUPERVISOR', 'INSTITUTION_ADMIN', 'INSTITUTION_SUPER_ADMIN', 'PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN', 'CLINICAL_REVIEWER')
    )
  );

create policy prompt_versions_platform on public.prompt_versions
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.is_active = true
        and m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN', 'CLINICAL_REVIEWER')
    )
  );

create policy model_configs_platform on public.model_configs
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.is_active = true
        and m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN')
    )
  );

-- Seed guided exercises (not medical treatment)
insert into public.guided_exercises (slug, name, description, duration_minutes, steps, language, clinical_approval_status, version, status)
values
  ('breathing-box', 'Box breathing', 'A short paced-breathing reset for exam or placement stress. Not medical treatment.', 4,
   '[{"title":"Inhale","seconds":4},{"title":"Hold","seconds":4},{"title":"Exhale","seconds":4},{"title":"Hold","seconds":4}]'::jsonb,
   'en', 'REVIEW', '1.0.0', 'ACTIVE'),
  ('grounding-54321', '5-4-3-2-1 grounding', 'Orient to the present using senses. Not a clinical intervention.', 5,
   '[{"title":"5 things you see"},{"title":"4 things you feel"},{"title":"3 things you hear"},{"title":"2 things you smell"},{"title":"1 thing you taste"}]'::jsonb,
   'en', 'REVIEW', '1.0.0', 'ACTIVE'),
  ('exam-stress-reset', 'Exam stress reset', 'Brief cognitive unload before or after an exam block.', 6,
   '[{"title":"Name the worry"},{"title":"What is one controllable next step?"},{"title":"Take three slow breaths"},{"title":"Return to the smallest next action"}]'::jsonb,
   'en', 'REVIEW', '1.0.0', 'ACTIVE'),
  ('sleep-prep', 'Sleep preparation', 'Wind-down sequence for hostel nights. Not a sleep disorder treatment.', 8,
   '[{"title":"Dim screens"},{"title":"Write tomorrow''s top 1 task"},{"title":"Slow breathing x5"},{"title":"Lights down"}]'::jsonb,
   'en', 'REVIEW', '1.0.0', 'ACTIVE'),
  ('homesickness', 'Homesickness support', 'Gentle reflection for students far from home.', 7,
   '[{"title":"Acknowledge the feeling"},{"title":"Name one connection you can reach today"},{"title":"Plan a small comforting routine"}]'::jsonb,
   'en', 'REVIEW', '1.0.0', 'ACTIVE');

-- Seed active system prompt (content mirrored in app registry for offline)
insert into public.prompt_versions (name, version, environment, status, content, deployment_date)
values (
  'master_system',
  '1.0.0',
  'development',
  'ACTIVE',
  'You are ManoYug AI, an AI student wellbeing companion. You are an AI system — not a human, therapist, psychologist, psychiatrist, doctor, emergency responder, lawyer, parent, teacher, or romantic partner. Prioritize safety over engagement. Never diagnose, prescribe, invent crisis numbers, fabricate actions, or claim you contacted a counsellor unless the backend confirmed it. Use English, Hindi, or Hinglish per preference. For elevated risk, follow application safety state.',
  now()
);
