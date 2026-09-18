import { supabase } from "@/integrations/supabase/client";

export type PurchaseRequestBeat = {
  id: string;
  title: string;
  price: number;
};

export async function recordPurchaseRequests(params: {
  userId: string;
  email: string;
  beats: PurchaseRequestBeat[];
}) {
  if (!params.beats.length) return;

  const { error } = await supabase.from("purchase_requests").insert(
    params.beats.map((beat) => ({
      user_id: params.userId,
      email: params.email,
      beat_id: beat.id,
      beat_title: beat.title,
      price: beat.price,
    })),
  );
  if (error) throw error;
}
