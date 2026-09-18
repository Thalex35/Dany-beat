-- Dany Beats initial schema
-- Run this once in a new Supabase project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), split_part(COALESCE(NEW.email, ''), '@', 1), 'Auditeur'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.beats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  genre text,
  mood text,
  bpm integer CHECK (bpm IS NULL OR bpm BETWEEN 20 AND 400),
  song_key text,
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  licenses jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  cover_path text,
  preview_path text,
  master_path text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beat_id uuid NOT NULL REFERENCES public.beats(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, beat_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beat_id uuid NOT NULL REFERENCES public.beats(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.normalize_comment_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.content := btrim(regexp_replace(NEW.content, '\s+', ' ', 'g'));
  IF char_length(NEW.content) < 1 OR char_length(NEW.content) > 1000 THEN
    RAISE EXCEPTION 'Comment content must be between 1 and 1000 characters';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comments_content_normalize ON public.comments;
CREATE TRIGGER comments_content_normalize
BEFORE INSERT OR UPDATE OF content ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.normalize_comment_content();

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beat_id uuid NOT NULL REFERENCES public.beats(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, beat_id)
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  beat_id uuid REFERENCES public.beats(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  producer_name text NOT NULL DEFAULT 'DANY BEATS',
  producer_bio text NOT NULL DEFAULT '',
  hero_eyebrow text NOT NULL DEFAULT 'Catalogue indépendant',
  hero_title text NOT NULL DEFAULT 'Des instrumentales pour les artistes qui prennent leur disque au sérieux.',
  hero_description text NOT NULL DEFAULT '',
  producer_photo_path text,
  whatsapp_number text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS beats_status_idx ON public.beats(status, published_at DESC);
CREATE INDEX IF NOT EXISTS beats_genre_idx ON public.beats(genre);
CREATE INDEX IF NOT EXISTS likes_beat_idx ON public.likes(beat_id);
CREATE INDEX IF NOT EXISTS comments_beat_idx ON public.comments(beat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id, created_at ASC);
CREATE INDEX IF NOT EXISTS cart_items_user_idx ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS analytics_beat_type_idx ON public.analytics_events(beat_id, event_type);
CREATE INDEX IF NOT EXISTS analytics_created_idx ON public.analytics_events(created_at DESC);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS beats_updated_at ON public.beats;
CREATE TRIGGER beats_updated_at BEFORE UPDATE ON public.beats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS comments_updated_at ON public.comments;
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.beats TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.beats TO authenticated;
GRANT SELECT ON public.likes, public.comments TO anon, authenticated;
GRANT INSERT, DELETE ON public.likes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.cart_items TO authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;

DROP POLICY IF EXISTS "profiles are public" ON public.profiles;
CREATE POLICY "profiles are public" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "users insert own profile" ON public.profiles;
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "published beats are public" ON public.beats;
CREATE POLICY "published beats are public" ON public.beats FOR SELECT
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins insert beats" ON public.beats;
CREATE POLICY "admins insert beats" ON public.beats FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins update beats" ON public.beats;
CREATE POLICY "admins update beats" ON public.beats FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins delete beats" ON public.beats;
CREATE POLICY "admins delete beats" ON public.beats FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "likes are public" ON public.likes;
CREATE POLICY "likes are public" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "users create own likes" ON public.likes;
CREATE POLICY "users create own likes" ON public.likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users delete own likes" ON public.likes;
CREATE POLICY "users delete own likes" ON public.likes FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "comments are public" ON public.comments;
CREATE POLICY "comments are public" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "users create own comments" ON public.comments;
CREATE POLICY "users create own comments" ON public.comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (parent_id IS NULL OR EXISTS (SELECT 1 FROM public.comments parent WHERE parent.id = parent_id AND parent.beat_id = beat_id)));
DROP POLICY IF EXISTS "users update own comments" ON public.comments;
CREATE POLICY "users update own comments" ON public.comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "users or admins delete comments" ON public.comments;
CREATE POLICY "users or admins delete comments" ON public.comments FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "users read own cart" ON public.cart_items;
CREATE POLICY "users read own cart" ON public.cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "users add to own cart" ON public.cart_items;
CREATE POLICY "users add to own cart" ON public.cart_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users remove own cart" ON public.cart_items;
CREATE POLICY "users remove own cart" ON public.cart_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "anyone records analytics" ON public.analytics_events;
CREATE POLICY "anyone records analytics" ON public.analytics_events FOR INSERT TO anon, authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
DROP POLICY IF EXISTS "admins read analytics" ON public.analytics_events;
CREATE POLICY "admins read analytics" ON public.analytics_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "settings are public" ON public.site_settings;
CREATE POLICY "settings are public" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins update settings" ON public.site_settings;
CREATE POLICY "admins update settings" ON public.site_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'an admin already exists';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_admin(_user_id uuid, _make boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _make THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'cannot remove the last admin';
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.beat_public_stats()
RETURNS TABLE (beat_id uuid, likes bigint, comments bigint, plays bigint, views bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.id,
    (SELECT count(*) FROM public.likes l WHERE l.beat_id = b.id),
    (SELECT count(*) FROM public.comments c WHERE c.beat_id = b.id),
    (SELECT count(*) FROM public.analytics_events e WHERE e.beat_id = b.id AND e.event_type = 'beat_play'),
    (SELECT count(*) FROM public.analytics_events e WHERE e.beat_id = b.id AND e.event_type = 'beat_view')
  FROM public.beats b WHERE b.status = 'published';
$$;

CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN jsonb_build_object(
    'users', (SELECT count(*) FROM public.profiles),
    'active_users', (SELECT count(DISTINCT user_id) FROM public.analytics_events WHERE user_id IS NOT NULL AND created_at > now() - interval '30 days'),
    'published_beats', (SELECT count(*) FROM public.beats WHERE status = 'published'),
    'draft_beats', (SELECT count(*) FROM public.beats WHERE status = 'draft'),
    'views', (SELECT count(*) FROM public.analytics_events WHERE event_type = 'beat_view'),
    'plays', (SELECT count(*) FROM public.analytics_events WHERE event_type = 'beat_play'),
    'likes', (SELECT count(*) FROM public.likes),
    'comments', (SELECT count(*) FROM public.comments),
    'whatsapp', (SELECT count(*) FROM public.analytics_events WHERE event_type = 'whatsapp_click'),
    'cart_items', (SELECT count(*) FROM public.cart_items)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_beat_stats(_beat_id uuid DEFAULT NULL)
RETURNS TABLE (beat_id uuid, title text, views bigint, plays bigint, likes bigint, comments bigint, whatsapp bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT b.id, b.title,
    (SELECT count(*) FROM public.analytics_events e WHERE e.beat_id = b.id AND e.event_type = 'beat_view'),
    (SELECT count(*) FROM public.analytics_events e WHERE e.beat_id = b.id AND e.event_type = 'beat_play'),
    (SELECT count(*) FROM public.likes l WHERE l.beat_id = b.id),
    (SELECT count(*) FROM public.comments c WHERE c.beat_id = b.id),
    (SELECT count(*) FROM public.analytics_events e WHERE e.beat_id = b.id AND e.event_type = 'whatsapp_click')
  FROM public.beats b WHERE _beat_id IS NULL OR b.id = _beat_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_events_daily(_days integer DEFAULT 30, _beat_id uuid DEFAULT NULL)
RETURNS TABLE (day date, event_type text, count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT (e.created_at AT TIME ZONE 'utc')::date, e.event_type, count(*)
  FROM public.analytics_events e
  WHERE e.created_at > now() - make_interval(days => greatest(_days, 1))
    AND (_beat_id IS NULL OR e.beat_id = _beat_id)
  GROUP BY 1, 2 ORDER BY 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_users_overview()
RETURNS TABLE (id uuid, display_name text, email text, created_at timestamptz, likes bigint, comments bigint, last_seen timestamptz, is_admin boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT p.id, p.display_name, u.email::text, p.created_at,
    (SELECT count(*) FROM public.likes l WHERE l.user_id = p.id),
    (SELECT count(*) FROM public.comments c WHERE c.user_id = p.id),
    (SELECT max(e.created_at) FROM public.analytics_events e WHERE e.user_id = p.id),
    public.has_role(p.id, 'admin')
  FROM public.profiles p JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_cart_overview()
RETURNS TABLE (id uuid, user_id uuid, display_name text, email text, beat_id uuid, beat_title text, beat_slug text, price numeric, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT c.id, c.user_id, p.display_name, u.email::text, b.id, b.title, b.slug, b.price, c.created_at
  FROM public.cart_items c
  JOIN public.beats b ON b.id = c.beat_id
  LEFT JOIN public.profiles p ON p.id = c.user_id
  JOIN auth.users u ON u.id = c.user_id
  ORDER BY c.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_admin(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.beat_public_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_beat_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_events_daily(integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_users_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cart_overview() TO authenticated;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM anon;
REVOKE ALL ON FUNCTION public.admin_set_admin(uuid, boolean) FROM anon;

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true), ('previews', 'previews', true), ('masters', 'masters', false), ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "public read covers" ON storage.objects;
CREATE POLICY "public read covers" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'covers');
DROP POLICY IF EXISTS "public read previews" ON storage.objects;
CREATE POLICY "public read previews" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'previews');
DROP POLICY IF EXISTS "public read site assets" ON storage.objects;
CREATE POLICY "public read site assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-assets');
DROP POLICY IF EXISTS "admins manage covers" ON storage.objects;
CREATE POLICY "admins manage covers" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins manage previews" ON storage.objects;
CREATE POLICY "admins manage previews" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'previews' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'previews' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins manage masters" ON storage.objects;
CREATE POLICY "admins manage masters" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'masters' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'masters' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins manage site assets" ON storage.objects;
CREATE POLICY "admins manage site assets" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- After creating your account, make it the first admin by opening /admin.
-- The app will show the one-time "Devenir administrateur" action while no admin exists.
-- Or assign a known account manually:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('USER_UUID_HERE', 'admin') ON CONFLICT DO NOTHING;
