-- Link an onboarding request to the institution provisioned from it.
-- Apply after the platform expansion migrations.
alter table public.institution_requests
  add column if not exists institution_id uuid references public.institutions(id) on delete set null;

alter table public.institutions
  add column if not exists website text;

create index if not exists institution_requests_institution_idx
  on public.institution_requests (institution_id);

drop trigger if exists institution_requests_updated_at on public.institution_requests;
create trigger institution_requests_updated_at
  before update on public.institution_requests
  for each row execute function public.set_updated_at();
