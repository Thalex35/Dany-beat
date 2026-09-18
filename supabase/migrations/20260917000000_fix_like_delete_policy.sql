GRANT DELETE ON public.likes TO authenticated;

DROP POLICY IF EXISTS "users delete own likes" ON public.likes;
CREATE POLICY "users delete own likes"
ON public.likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));