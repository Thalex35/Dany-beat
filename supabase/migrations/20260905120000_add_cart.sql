-- Panier : permet à un utilisateur connecté d'ajouter des beats à son panier.
-- Le producteur (admin) peut ensuite voir qui a mis quoi dans son panier et
-- le contacter (nom + e-mail déjà disponibles via le compte utilisateur).

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  beat_id uuid not null references public.beats(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, beat_id)
);
create index cart_items_user_idx on public.cart_items(user_id);
create index cart_items_beat_idx on public.cart_items(beat_id);
grant select, insert, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;

create policy "users read own cart" on public.cart_items
  for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "users add to own cart" on public.cart_items
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "users remove from own cart" on public.cart_items
  for delete to authenticated
  using (auth.uid() = user_id);

-- Autorise de nouveaux types d'évènements analytiques liés au panier et au contact.
alter table public.analytics_events drop constraint if exists analytics_events_event_type_check;
alter table public.analytics_events add constraint analytics_events_event_type_check
  check (event_type in (
    'beat_view','beat_play','beat_like','beat_unlike','beat_comment',
    'whatsapp_click','user_signup','user_login',
    'cart_add','cart_remove','contact_email_click','contact_whatsapp_click'
  ));

-- Vue d'ensemble du panier pour l'admin : qui a mis quoi, avec ses coordonnées.
create or replace function public.admin_cart_overview()
returns table (
  id uuid,
  user_id uuid,
  display_name text,
  email text,
  beat_id uuid,
  beat_title text,
  beat_slug text,
  price numeric,
  created_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  return query
  select c.id, c.user_id, p.display_name, u.email::text, b.id, b.title, b.slug, b.price, c.created_at
  from public.cart_items c
  join public.beats b on b.id = c.beat_id
  left join public.profiles p on p.id = c.user_id
  left join auth.users u on u.id = c.user_id
  order by c.created_at desc;
end; $$;
grant execute on function public.admin_cart_overview() to authenticated;
revoke all on function public.admin_cart_overview() from public, anon;

-- Ajoute le nombre d'articles en panier au tableau de bord admin.
create or replace function public.admin_overview()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'active_users', (select count(distinct user_id) from public.analytics_events where user_id is not null and created_at > now() - interval '30 days'),
    'published_beats', (select count(*) from public.beats where status = 'published'),
    'draft_beats', (select count(*) from public.beats where status = 'draft'),
    'views', (select count(*) from public.analytics_events where event_type = 'beat_view'),
    'plays', (select count(*) from public.analytics_events where event_type = 'beat_play'),
    'likes', (select count(*) from public.likes),
    'comments', (select count(*) from public.comments),
    'whatsapp', (select count(*) from public.analytics_events where event_type = 'whatsapp_click'),
    'cart_items', (select count(*) from public.cart_items)
  ) into result;
  return result;
end; $$;
