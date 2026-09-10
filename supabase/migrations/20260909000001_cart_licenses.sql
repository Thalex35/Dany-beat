ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS license_id text,
  ADD COLUMN IF NOT EXISTS license_name text,
  ADD COLUMN IF NOT EXISTS license_price numeric(10,2);

ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_license_price_check;

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_license_price_check
  CHECK (license_price IS NULL OR license_price >= 0);
