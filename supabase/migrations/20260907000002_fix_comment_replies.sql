-- Allow authenticated users to reply to any comment on the same beat.
DROP POLICY IF EXISTS "users create own comments" ON public.comments;
CREATE POLICY "users create own comments" ON public.comments FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = public.comments.user_id
  AND (
    public.comments.parent_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.comments AS parent
      WHERE parent.id = public.comments.parent_id
        AND parent.beat_id = public.comments.beat_id
    )
  )
);