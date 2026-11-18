CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint text PRIMARY KEY CHECK (endpoint LIKE 'https://%'),
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT INSERT, UPDATE, DELETE ON public.push_subscriptions TO anon, authenticated;

CREATE POLICY "Visitors can register Push subscriptions"
  ON public.push_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Visitors can refresh Push subscriptions"
  ON public.push_subscriptions
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Visitors can remove their Push subscription"
  ON public.push_subscriptions
  FOR DELETE TO anon, authenticated
  USING (true);
