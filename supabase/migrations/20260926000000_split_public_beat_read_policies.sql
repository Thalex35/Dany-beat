DROP POLICY IF EXISTS "published beats are public" ON public.beats;

CREATE POLICY "published beats are public"
ON public.beats
FOR SELECT
TO anon
USING (status = 'published');

CREATE POLICY "published beats and admin drafts are visible"
ON public.beats
FOR SELECT
TO authenticated
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));