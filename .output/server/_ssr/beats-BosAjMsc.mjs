import { t as supabase } from "./client-B4XIc1gZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beats-BosAjMsc.js
var BEAT_COLUMNS = "id, title, slug, description, genre, mood, bpm, song_key, price, licenses, tags, cover_path, preview_path, master_path, status, featured, created_at, published_at";
function slugify(value) {
	return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
var publishedBeatsQuery = (params) => ({
	queryKey: [
		"beats",
		"published",
		params
	],
	queryFn: async () => {
		const from = params.page * params.pageSize;
		const to = from + params.pageSize - 1;
		let query = supabase.from("beats").select(BEAT_COLUMNS, { count: "exact" }).eq("status", "published");
		if (params.search.trim()) {
			const search = params.search.trim().replace(/[%,()]/g, " ");
			query = query.or(`title.ilike.%${search}%,genre.ilike.%${search}%,mood.ilike.%${search}%`);
		}
		if (params.genre !== "all") query = query.eq("genre", params.genre);
		if (params.mood !== "all") query = query.eq("mood", params.mood);
		if (params.sort === "price-asc") query = query.order("price", { ascending: true });
		else if (params.sort === "price-desc") query = query.order("price", { ascending: false });
		else query = query.order("published_at", {
			ascending: params.sort === "oldest",
			nullsFirst: false
		});
		const { data, count, error } = await query.range(from, to);
		if (error) throw error;
		return {
			beats: data ?? [],
			total: count ?? 0
		};
	}
});
var beatFilterOptionsQuery = {
	queryKey: ["beat-filter-options"],
	staleTime: 3e5,
	queryFn: async () => {
		const { data, error } = await supabase.from("beats").select("genre, mood").eq("status", "published");
		if (error) throw error;
		return data ?? [];
	}
};
var beatStatsQuery = (beatIds) => ({
	queryKey: ["beat-stats", beatIds ?? "all"],
	staleTime: 3e4,
	queryFn: async () => {
		const { data, error } = await supabase.rpc("beat_public_stats", { _beat_ids: beatIds === void 0 ? null : beatIds });
		if (error) throw error;
		const map = {};
		for (const row of data ?? []) map[row.beat_id] = row;
		return map;
	}
});
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
export { formatPrice as a, slugify as c, formatCount as i, beatFilterOptionsQuery as n, formatTime as o, beatStatsQuery as r, publishedBeatsQuery as s, BEAT_COLUMNS as t };
