import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  producer_name: string;
  producer_bio: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  producer_photo_path: string | null;
  whatsapp_number: string;
  contact_email: string;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
};

export const settingsQuery = {
  queryKey: ["site-settings"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<SiteSettings | null> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "producer_name, producer_bio, hero_eyebrow, hero_title, hero_description, producer_photo_path, whatsapp_number, contact_email, instagram_url, youtube_url, tiktok_url",
      )
      .maybeSingle();
    if (error) throw error;
    return data as SiteSettings | null;
  },
};

export function useSettings() {
  return useQuery(settingsQuery);
}
