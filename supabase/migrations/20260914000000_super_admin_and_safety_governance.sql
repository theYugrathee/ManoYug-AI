-- Platform-only access is independent from an institution membership.
-- Apply this migration in full through the Supabase SQL editor or CLI.

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

create index if not exists profiles_is_super_admin_idx
  on public.profiles (is_super_admin)
  where is_super_admin = true;

-- Mark the requested owner account as platform-only if that Auth account exists.
-- This intentionally creates no student roster row or institution membership.
do $$
declare
  owner_user_id uuid;
begin
  select id into owner_user_id
  from auth.users
  where lower(email) = 'yugrathee28@gmail.com'
  limit 1;

  if owner_user_id is not null then
    insert into public.profiles (id, email, is_super_admin)
    values (owner_user_id, 'yugrathee28@gmail.com', true)
    on conflict (id) do update
      set email = excluded.email,
          is_super_admin = true,
          updated_at = now();
  end if;
end;
$$;

-- Team members can be promoted with the same flag after their Auth account
-- exists. The application verifies this server-side; the browser never grants it.
create or replace function public.current_user_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  );
$$;

revoke all on function public.current_user_is_super_admin() from public;
grant execute on function public.current_user_is_super_admin() to authenticated;

drop policy if exists profiles_update_platform_admin on public.profiles;
create policy profiles_update_platform_admin on public.profiles
  for update
  using (public.current_user_is_super_admin())
  with check (true);
