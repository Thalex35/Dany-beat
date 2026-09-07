import { t as supabase } from "./client-B4XIc1gZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beats-B5LKfYIS.js
var BEAT_COLUMNS = "id, title, slug, description, genre, mood, bpm, song_key, price, licenses, tags, cover_path, preview_path, master_path, status, featured, created_at, published_at";
function slugify(value) {
	return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
var publishedBeatsQuery = {
	queryKey: ["beats", "published"],
	queryFn: async () => {
		const { data, error } = await supabase.from("beats").select(BEAT_COLUMNS).eq("status", "published").order("published_at", {
			ascending: false,
			nullsFirst: false
		});
		if (error) throw error;
		return data ?? [];
	}
};
var beatStatsQuery = {
	queryKey: ["beat-stats"],
	staleTime: 3e4,
	queryFn: async () => {
		const { data, error } = await supabase.rpc("beat_public_stats");
		if (error) throw error;
		const map = {};
		for (const row of data ?? []) map[row.beat_id] = row;
		return map;
	}
};
function formatPrice(value) {
	if (value == null) return "—";
	return `$${Number(value).toFixed(2)}`;
}
function formatCount(value) {
	const n = value ?? 0;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
	return String(n);
}
function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}
//#endregion
export { formatTime as a, formatPrice as i, beatStatsQuery as n, publishedBeatsQuery as o, formatCount as r, slugify as s, BEAT_COLUMNS as t };
