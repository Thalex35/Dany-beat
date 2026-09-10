-- Keep public catalogue stats bounded to the beats currently being displayed.
DROP FUNCTION IF EXISTS public.beat_public_stats();

CREATE OR REPLACE FUNCTION public.beat_public_stats(_beat_ids uuid[] DEFAULT NULL)
RETURNS TABLE (beat_id uuid, likes bigint, comments bigint, plays bigint, views bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH visible_beats AS (
    SELECT b.id
    FROM public.beats b
    WHERE b.status = 'published'
      AND (_beat_ids IS NULL OR b.id = ANY(_beat_ids))
  ),
  like_counts AS (
    SELECT l.beat_id, count(*) AS total
    FROM public.likes l
    JOIN visible_beats b ON b.id = l.beat_id
    GROUP BY l.beat_id
  ),
  comment_counts AS (
    SELECT c.beat_id, count(*) AS total
    FROM public.comments c
    JOIN visible_beats b ON b.id = c.beat_id
    GROUP BY c.beat_id
  ),
  event_counts AS (
    SELECT e.beat_id,
      count(*) FILTER (WHERE e.event_type = 'beat_play') AS plays,
      count(*) FILTER (WHERE e.event_type = 'beat_view') AS views
    FROM public.analytics_events e
    JOIN visible_beats b ON b.id = e.beat_id
    GROUP BY e.beat_id
  )
  SELECT b.id,
    COALESCE(l.total, 0),
    COALESCE(c.total, 0),
    COALESCE(e.plays, 0),
    COALESCE(e.views, 0)
  FROM visible_beats b
  LEFT JOIN like_counts l ON l.beat_id = b.id
  LEFT JOIN comment_counts c ON c.beat_id = b.id
  LEFT JOIN event_counts e ON e.beat_id = b.id;
$$;

GRANT EXECUTE ON FUNCTION public.beat_public_stats(uuid[]) TO anon, authenticated;

CREATE INDEX IF NOT EXISTS analytics_event_type_created_idx
  ON public.analytics_events(event_type, created_at DESC);
