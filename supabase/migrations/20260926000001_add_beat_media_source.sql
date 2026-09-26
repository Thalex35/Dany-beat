ALTER TABLE public.beats
  ADD COLUMN media_source text NOT NULL DEFAULT 'upload'
  CHECK (media_source IN ('upload', 'youtube'));

ALTER TABLE public.beats
  ADD CONSTRAINT beats_youtube_source_url_check
  CHECK (media_source <> 'youtube' OR youtube_url IS NOT NULL);