CREATE INDEX IF NOT EXISTS beats_published_revision_idx
  ON public.beats(updated_at DESC)
  WHERE status = 'published';

CREATE OR REPLACE FUNCTION public.public_catalogue_revision()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::text || ':' || COALESCE(max(updated_at)::text, '')
  FROM public.beats
  WHERE status = 'published';
$$;

REVOKE ALL ON FUNCTION public.public_catalogue_revision() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_catalogue_revision() TO anon, authenticated;