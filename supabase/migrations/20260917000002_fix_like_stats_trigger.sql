CREATE OR REPLACE FUNCTION public.adjust_beat_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_beat_id uuid := COALESCE(NEW.beat_id, OLD.beat_id);
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (
    SELECT 1 FROM public.beats WHERE id = target_beat_id
  ) THEN
    RETURN OLD;
  END IF;

  IF TG_TABLE_NAME = 'likes' THEN
    INSERT INTO public.beat_stats (beat_id, likes, updated_at)
    VALUES (
      target_beat_id,
      (SELECT count(*) FROM public.likes WHERE beat_id = target_beat_id),
      now()
    )
    ON CONFLICT (beat_id) DO UPDATE SET
      likes = (SELECT count(*) FROM public.likes WHERE beat_id = target_beat_id),
      updated_at = now();
  ELSIF TG_TABLE_NAME = 'comments' THEN
    INSERT INTO public.beat_stats (beat_id, comments, updated_at)
    VALUES (target_beat_id, GREATEST(0, 1), now())
    ON CONFLICT (beat_id) DO UPDATE SET
      comments = GREATEST(0, public.beat_stats.comments + CASE WHEN TG_OP = 'DELETE' THEN -1 ELSE 1 END),
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
      CASE WHEN COALESCE(NEW.event_type, OLD.event_type) = 'beat_play' THEN 1 ELSE 0 END,
      CASE WHEN COALESCE(NEW.event_type, OLD.event_type) = 'beat_view' THEN 1 ELSE 0 END,
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

UPDATE public.beat_stats stats
SET likes = counts.likes,
    updated_at = now()
FROM (
  SELECT b.id AS beat_id, count(l.id) AS likes
  FROM public.beats b
  LEFT JOIN public.likes l ON l.beat_id = b.id
  GROUP BY b.id
) counts
WHERE stats.beat_id = counts.beat_id;