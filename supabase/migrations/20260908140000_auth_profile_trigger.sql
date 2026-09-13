-- Auth profile bootstrap + analytics event for OTP verification
-- Apply after 20260908120000_init_tenancy.sql

-- Create profile row when auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'phone', null)
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow authenticated users to insert their own analytics events (no sensitive content)
create policy analytics_events_insert_own on public.analytics_events
  for insert
  with check (user_id = auth.uid() or user_id is null);

-- Students may not read other users' analytics
create policy analytics_events_select_own on public.analytics_events
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.is_active = true
        and m.role in (
          'INSTITUTION_ADMIN',
          'INSTITUTION_SUPER_ADMIN',
          'PLATFORM_ADMIN',
          'PLATFORM_SUPER_ADMIN',
          'PLATFORM_SUPPORT'
        )
        and (
          analytics_events.institution_id is null
          or m.institution_id = analytics_events.institution_id
          or m.role in ('PLATFORM_ADMIN', 'PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPPORT')
        )
    )
  );
