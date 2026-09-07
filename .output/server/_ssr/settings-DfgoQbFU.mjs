import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DfgoQbFU.js
var settingsQuery = {
	queryKey: ["site-settings"],
	staleTime: 3e5,
	queryFn: async () => {
		const { data, error } = await supabase.from("site_settings").select("producer_name, producer_bio, hero_eyebrow, hero_title, hero_description, producer_photo_path, whatsapp_number, contact_email, instagram_url, youtube_url, tiktok_url").maybeSingle();
		if (error) throw error;
		return data;
	}
};
function useSettings() {
	return useQuery(settingsQuery);
}
//#endregion
export { useSettings as n, settingsQuery as t };
