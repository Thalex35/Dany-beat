import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { f as Search } from "../_libs/lucide-react.mjs";
import { i as Skeleton, n as EmptyState, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { n as beatStatsQuery, o as publishedBeatsQuery } from "./beats-B5LKfYIS.mjs";
import { t as SiteLayout } from "./SiteLayout-n8TOtS6N.mjs";
import { n as Input, r as Select } from "./field-C2NZwmZ2.mjs";
import { t as BeatCard } from "./BeatCard-BCiFNL74.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beats-DZzCYGH7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BeatsPage() {
	const beats = useQuery(publishedBeatsQuery);
	const stats = useQuery(beatStatsQuery);
	const [search, setSearch] = (0, import_react.useState)("");
	const [genre, setGenre] = (0, import_react.useState)("all");
	const [mood, setMood] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const all = beats.data ?? [];
	const genres = (0, import_react.useMemo)(() => Array.from(new Set(all.map((b) => b.genre).filter(Boolean))).sort(), [all]);
	const moods = (0, import_react.useMemo)(() => Array.from(new Set(all.map((b) => b.mood).filter(Boolean))).sort(), [all]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		const result = all.filter((b) => {
			if (genre !== "all" && b.genre !== genre) return false;
			if (mood !== "all" && b.mood !== mood) return false;
			if (!q) return true;
			return b.title.toLowerCase().includes(q) || (b.genre ?? "").toLowerCase().includes(q) || (b.mood ?? "").toLowerCase().includes(q) || (b.tags ?? []).some((t) => t.toLowerCase().includes(q));
		});
		const byDate = (v, fallback) => new Date(v ?? fallback).getTime();
		return result.sort((a, b) => {
			switch (sort) {
				case "oldest": return byDate(a.published_at, a.created_at) - byDate(b.published_at, b.created_at);
				case "price-asc": return a.price - b.price;
				case "price-desc": return b.price - a.price;
				case "popular": return (stats.data?.[b.id]?.plays ?? 0) - (stats.data?.[a.id]?.plays ?? 0);
				default: return byDate(b.published_at, b.created_at) - byDate(a.published_at, a.created_at);
			}
		});
	}, [
		all,
		search,
		genre,
		mood,
		sort,
		stats.data
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "public-catalogue mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "public-page-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-semibold tracking-tighter sm:text-5xl",
					children: "Catalogue de beats"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-sm text-muted-foreground",
					children: "Chaque instrumentale s'écoute en qualité preview. Un coup de cœur ? Envoyez votre demande WhatsApp directement depuis la page du beat."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "public-filter-bar mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							className: "pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Rechercher par titre, tag ou ambiance",
							"aria-label": "Rechercher un beat",
							className: "pl-11"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: genre,
						onChange: (e) => setGenre(e.target.value),
						"aria-label": "Filtrer par genre",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Tous les genres"
						}), genres.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: g,
							children: g
						}, g))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: mood,
						onChange: (e) => setMood(e.target.value),
						"aria-label": "Filtrer par ambiance",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Toutes les ambiances"
						}), moods.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: m,
							children: m
						}, m))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: beats.isPending ? "Chargement…" : `${filtered.length} beat${filtered.length === 1 ? "" : "s"}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: sort,
					onChange: (e) => setSort(e.target.value),
					"aria-label": "Trier les beats",
					className: "w-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "newest",
							children: "Plus récents"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "oldest",
							children: "Plus anciens"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "popular",
							children: "Les plus écoutés"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "price-asc",
							children: "Prix croissant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "price-desc",
							children: "Prix décroissant"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10",
				children: beats.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square w-full" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/3" })
						]
					}, i))
				}) : beats.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					title: "Une erreur est survenue",
					description: "Le catalogue n'a pas pu être chargé.",
					onRetry: () => void beats.refetch()
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Aucun beat ne correspond à ces filtres",
					description: "Essayez d'effacer la recherche ou de choisir un autre genre."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
					children: filtered.map((beat) => {
						const s = stats.data?.[beat.id];
						return s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, {
							beat,
							stats: s
						}, beat.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, { beat }, beat.id);
					})
				})
			})
		]
	}) });
}
//#endregion
export { BeatsPage as component };
