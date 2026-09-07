import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { N as Headphones, c as Sparkles, x as Music4, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { i as Skeleton, n as EmptyState, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { r as beatStatsQuery, s as publishedBeatsQuery } from "./beats-BosAjMsc.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteLayout } from "./SiteLayout-DqeSBX0E.mjs";
import { t as BeatCard } from "./BeatCard-CNsuQcJm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-SFTSVuc6.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Fond vidéo du hero : la vidéo de l'utilisateur joue en boucle, sans son,
* derrière le contenu. Un poster (première image) s'affiche pendant le
* chargement, et un voile sombre garde le texte lisible par-dessus.
*/
function HeroBackground() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": "true",
		className: "pointer-events-none absolute inset-0 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "absolute inset-0 h-full w-full object-cover",
				src: "/video/hero-bg.mp4",
				poster: "/video/hero-bg-poster.jpg",
				autoPlay: true,
				loop: true,
				muted: true,
				playsInline: true,
				preload: "metadata"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-background/55" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-transparent" })
		]
	});
}
function HomePage() {
	const beats = useQuery(publishedBeatsQuery({
		page: 0,
		pageSize: 24,
		search: "",
		genre: "all",
		mood: "all",
		sort: "newest"
	}));
	const allBeats = beats.data?.beats ?? [];
	const stats = useQuery(beatStatsQuery(allBeats.map((beat) => beat.id)));
	const { data: settings } = useSettings();
	const featured = allBeats.filter((b) => b.featured).slice(0, 6);
	const list = featured.length ? featured : allBeats.slice(0, 6);
	const bioIntro = settings?.producer_bio?.split("\n").filter(Boolean)[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative overflow-hidden border-b border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroBackground, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-[11px] tracking-[0.3em] text-primary uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "size-3.5",
						"aria-hidden": "true"
					}), settings?.hero_eyebrow ?? "Catalogue indépendant"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-6 max-w-3xl text-5xl leading-[0.95] font-semibold tracking-tighter text-balance sm:text-7xl",
					children: settings?.hero_title ?? "Des instrumentales pour les artistes qui prennent leur disque au sérieux."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-xl text-base leading-relaxed text-muted-foreground",
					children: settings?.hero_description || bioIntro || "Production rap, trap, drill et afro. Écoutez tout le catalogue, puis écrivez directement au producteur pour obtenir votre licence."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/beats",
							children: ["Découvrir le catalogue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/about",
							children: "À propos du producteur"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8",
					children: [
						{
							icon: Music4,
							label: "Beats en ligne",
							value: beats.data?.length ?? "—"
						},
						{
							icon: Headphones,
							label: "Écoutes gratuites",
							value: "Toujours"
						},
						{
							icon: Sparkles,
							label: "Licences",
							value: "En direct"
						}
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
						className: "flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
							className: "size-3.5",
							"aria-hidden": "true"
						}), item.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-display mt-2 text-2xl font-medium",
						children: item.value
					})] }, item.label))
				})
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-6xl px-5 py-20 sm:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "Beats à la une"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Une sélection choisie dans le catalogue du moment."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/beats",
				className: "hidden text-xs tracking-widest text-primary uppercase hover:underline sm:block",
				children: "Tout voir"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10",
			children: beats.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
				children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/3" })
					]
				}, i))
			}) : beats.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Une erreur est survenue",
				description: "Le catalogue n'a pas pu être chargé pour le moment.",
				onRetry: () => void beats.refetch()
			}) : list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Aucun beat publié pour l'instant",
				description: "De nouvelles instrumentales arrivent très bientôt."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
				children: list.map((beat) => {
					const s = stats.data?.[beat.id];
					return s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, {
						beat,
						stats: s,
						queue: list
					}, beat.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, {
						beat,
						queue: list
					}, beat.id);
				})
			})
		})]
	})] });
}
//#endregion
export { HomePage as component };
