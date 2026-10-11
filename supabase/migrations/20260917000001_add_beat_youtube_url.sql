ALTER TABLE public.beats
  ADD COLUMN IF NOT EXISTS youtube_url text;

ALTER TABLE public.beats
  DROP CONSTRAINT IF EXISTS beats_youtube_url_check;

ALTER TABLE public.beats
  ADD CONSTRAINT beats_youtube_url_check
  CHECK (
    youtube_url IS NULL
    OR youtube_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be)/'
  );