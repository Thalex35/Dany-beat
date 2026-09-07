import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { f as Search } from "../_libs/lucide-react.mjs";
import { i as Skeleton, n as EmptyState, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { n as beatFilterOptionsQuery, r as beatStatsQuery, s as publishedBeatsQuery } from "./beats-BosAjMsc.mjs";
import { t as SiteLayout } from "./SiteLayout-DqeSBX0E.mjs";
import { n as Input, r as Select } from "./field-C2NZwmZ2.mjs";
import { t as BeatCard } from "./BeatCard-CNsuQcJm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beats-RL5P_akV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BeatsPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [genre, setGenre] = (0, import_react.useState)("all");
	const [mood, setMood] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const [page, setPage] = (0, import_react.useState)(0);
	const pageSize = 24;
	const beats = useQuery(publishedBeatsQuery({
		page,
		pageSize,
		search,
		genre,
		mood,
		sort
	}));
	const filterOptions = useQuery(beatFilterOptionsQuery);
	const all = (0, import_react.useMemo)(() => beats.data?.beats ?? [], [beats.data?.beats]);
	const stats = useQuery(beatStatsQuery(all.map((beat) => beat.id)));
	const genres = (0, import_react.useMemo)(() => Array.from(new Set((filterOptions.data ?? []).map((option) => option.genre).filter(Boolean))).sort(), [filterOptions.data]);
	const moods = (0, import_react.useMemo)(() => Array.from(new Set((filterOptions.data ?? []).map((option) => option.mood).filter(Boolean))).sort(), [filterOptions.data]);
	const total = beats.data?.total ?? 0;
	const pageCount = Math.ceil(total / pageSize);
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
							onChange: (e) => {
								setSearch(e.target.value);
								setPage(0);
							},
							placeholder: "Rechercher par titre, genre ou ambiance",
							"aria-label": "Rechercher un beat",
							className: "pl-11"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: genre,
						onChange: (e) => {
							setGenre(e.target.value);
							setPage(0);
						},
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
						onChange: (e) => {
							setMood(e.target.value);
							setPage(0);
						},
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
					children: beats.isPending ? "Chargement…" : `${total} beat${total === 1 ? "" : "s"}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: sort,
					onChange: (e) => {
						setSort(e.target.value);
						setPage(0);
					},
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
					className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-video w-full" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/3" })
						]
					}, i))
				}) : beats.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					title: "Une erreur est survenue",
					description: "Le catalogue n'a pas pu être chargé.",
					onRetry: () => void beats.refetch()
				}) : all.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Aucun beat ne correspond à ces filtres",
					description: "Essayez d'effacer la recherche ou de choisir un autre genre."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
					children: all.map((beat) => {
						const s = stats.data?.[beat.id];
						return s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, {
							beat,
							stats: s,
							queue: all
						}, beat.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, {
							beat,
							queue: all
						}, beat.id);
					})
				})
			}),
			pageCount > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex items-center justify-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: page === 0,
						onClick: () => setPage((p) => p - 1),
						children: "Précédent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [
							"Page ",
							page + 1,
							" sur ",
							pageCount
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: page + 1 >= pageCount,
						onClick: () => setPage((p) => p + 1),
						children: "Suivant"
					})
				]
			}) : null
		]
	}) });
}
//#endregion
export { BeatsPage as component };
