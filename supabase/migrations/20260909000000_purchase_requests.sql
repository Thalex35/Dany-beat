CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beat_id uuid NOT NULL REFERENCES public.beats(id) ON DELETE CASCADE,
  email text NOT NULL,
  beat_title text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_discussion', 'sold', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchase_requests_created_idx
  ON public.purchase_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS purchase_requests_status_idx
  ON public.purchase_requests(status, created_at DESC);

DROP TRIGGER IF EXISTS purchase_requests_updated_at ON public.purchase_requests;
CREATE TRIGGER purchase_requests_updated_at
BEFORE UPDATE ON public.purchase_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.purchase_requests TO authenticated;
GRANT UPDATE ON public.purchase_requests TO authenticated;

DROP POLICY IF EXISTS "users read own purchase requests" ON public.purchase_requests;
CREATE POLICY "users read own purchase requests"
ON public.purchase_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "users create own purchase requests" ON public.purchase_requests;
CREATE POLICY "users create own purchase requests"
ON public.purchase_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND email = COALESCE(auth.jwt() ->> 'email', email));

DROP POLICY IF EXISTS "admins update purchase requests" ON public.purchase_requests;
CREATE POLICY "admins update purchase requests"
ON public.purchase_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_purchase_requests()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  email text,
  beat_id uuid,
  beat_title text,
  beat_slug text,
  price numeric,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT r.id, r.user_id, p.display_name, r.email, r.beat_id, r.beat_title,
    b.slug, r.price, r.status, r.created_at, r.updated_at
  FROM public.purchase_requests r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  LEFT JOIN public.beats b ON b.id = r.beat_id
  ORDER BY r.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_purchase_request_status(_id uuid, _status text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('new', 'contacted', 'in_discussion', 'sold', 'cancelled') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  UPDATE public.purchase_requests SET status = _status WHERE id = _id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_purchase_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_purchase_request_status(uuid, text) TO authenticated;
