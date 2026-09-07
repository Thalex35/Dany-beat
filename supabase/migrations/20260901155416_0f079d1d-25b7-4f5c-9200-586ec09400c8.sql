create or replace function public.admin_exists()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;

create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    raise exception 'an admin already exists';
  end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin')
  on conflict (user_id, role) do nothing;
  return true;
end; $$;

create or replace function public.admin_set_admin(_user_id uuid, _make boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  if _make then
    insert into public.user_roles (user_id, role) values (_user_id, 'admin')
    on conflict (user_id, role) do nothing;
  else
    if (select count(*) from public.user_roles where role = 'admin') <= 1 then
      raise exception 'cannot remove the last admin';
    end if;
    delete from public.user_roles where user_id = _user_id and role = 'admin';
  end if;
  return true;
end; $$;

revoke all on function public.claim_first_admin() from public, anon;
revoke all on function public.admin_set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_exists() to anon, authenticated;
grant execute on function public.claim_first_admin() to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;

drop function if exists public.admin_users_overview();

create or replace function public.admin_users_overview()
returns table(id uuid, display_name text, email text, created_at timestamptz, likes bigint, comments bigint, last_seen timestamptz, is_admin boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  return query
  select p.id, p.display_name, u.email::text, p.created_at,
    (select count(*) from public.likes l where l.user_id=p.id),
    (select count(*) from public.comments c where c.user_id=p.id),
    (select max(e.created_at) from public.analytics_events e where e.user_id=p.id),
    exists (select 1 from public.user_roles r where r.user_id=p.id and r.role='admin')
  from public.profiles p join auth.users u on u.id = p.id
  order by p.created_at desc;
end; $$;