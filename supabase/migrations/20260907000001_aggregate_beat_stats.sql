-- Maintain one aggregate stats row per beat so public reads do not recount large tables.
CREATE TABLE IF NOT EXISTS public.beat_stats (
  beat_id uuid PRIMARY KEY REFERENCES public.beats(id) ON DELETE CASCADE,
  likes bigint NOT NULL DEFAULT 0 CHECK (likes >= 0),
  comments bigint NOT NULL DEFAULT 0 CHECK (comments >= 0),
  plays bigint NOT NULL DEFAULT 0 CHECK (plays >= 0),
  views bigint NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.beat_stats (beat_id, likes, comments, plays, views)
SELECT b.id,
  (SELECT count(*) FROM public.likes l WHERE l.beat_id = b.id),
  (SELECT count(*) FROM public.comments c WHERE c.beat_id = b.id),
  (SELECT count(*) FROM public.analytics_events e WHERE e.beat_id = b.id AND e.event_type = 'beat_play'),
  (SELECT count(*) FROM public.analytics_events e WHERE e.beat_id = b.id AND e.event_type = 'beat_view')
FROM public.beats b
ON CONFLICT (beat_id) DO UPDATE SET
  likes = EXCLUDED.likes,
  comments = EXCLUDED.comments,
  plays = EXCLUDED.plays,
  views = EXCLUDED.views,
  updated_at = now();

CREATE OR REPLACE FUNCTION public.adjust_beat_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  delta bigint := CASE WHEN TG_OP = 'DELETE' THEN -1 ELSE 1 END;
  target_beat_id uuid := COALESCE(NEW.beat_id, OLD.beat_id);
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (
    SELECT 1 FROM public.beats WHERE id = target_beat_id
  ) THEN
    RETURN OLD;
  END IF;

  IF TG_TABLE_NAME = 'likes' THEN
    INSERT INTO public.beat_stats (beat_id, likes, updated_at)
    VALUES (target_beat_id, delta, now())
    ON CONFLICT (beat_id) DO UPDATE SET
      likes = GREATEST(0, public.beat_stats.likes + delta),
      updated_at = now();
  ELSIF TG_TABLE_NAME = 'comments' THEN
    INSERT INTO public.beat_stats (beat_id, comments, updated_at)
    VALUES (target_beat_id, delta, now())
    ON CONFLICT (beat_id) DO UPDATE SET
      comments = GREATEST(0, public.beat_stats.comments + delta),
      updated_at = now();
  ELSIF TG_TABLE_NAME = 'analytics_events' AND COALESCE(NEW.event_type, OLD.event_type) IN ('beat_play', 'beat_view') THEN
    INSERT INTO public.beat_stats (
      beat_id,
      plays,
      views,
      updated_at
    )
    VALUES (
      target_beat_id,
      CASE WHEN COALESCE(NEW.event_type, OLD.event_type) = 'beat_play' THEN delta ELSE 0 END,
      CASE WHEN COALESCE(NEW.event_type, OLD.event_type) = 'beat_view' THEN delta ELSE 0 END,
      now()
    )
    ON CONFLICT (beat_id) DO UPDATE SET
      plays = GREATEST(0, public.beat_stats.plays + EXCLUDED.plays),
      views = GREATEST(0, public.beat_stats.views + EXCLUDED.views),
      updated_at = now();
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS likes_update_beat_stats ON public.likes;
CREATE TRIGGER likes_update_beat_stats
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.adjust_beat_stats();

DROP TRIGGER IF EXISTS comments_update_beat_stats ON public.comments;
CREATE TRIGGER comments_update_beat_stats
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.adjust_beat_stats();

DROP TRIGGER IF EXISTS analytics_update_beat_stats ON public.analytics_events;
CREATE TRIGGER analytics_update_beat_stats
AFTER INSERT OR DELETE ON public.analytics_events
FOR EACH ROW EXECUTE FUNCTION public.adjust_beat_stats();

ALTER TABLE public.beat_stats ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.beat_public_stats(_beat_ids uuid[] DEFAULT NULL)
RETURNS TABLE (beat_id uuid, likes bigint, comments bigint, plays bigint, views bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.id,
    COALESCE(s.likes, 0),
    COALESCE(s.comments, 0),
    COALESCE(s.plays, 0),
    COALESCE(s.views, 0)
  FROM public.beats b
  LEFT JOIN public.beat_stats s ON s.beat_id = b.id
  WHERE b.status = 'published'
    AND (_beat_ids IS NULL OR b.id = ANY(_beat_ids));
$$;

GRANT EXECUTE ON FUNCTION public.beat_public_stats(uuid[]) TO anon, authenticated;
