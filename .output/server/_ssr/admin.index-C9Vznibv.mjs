import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as Skeleton, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { i as formatCount } from "./beats-BosAjMsc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-C9Vznibv.js
var import_jsx_runtime = require_jsx_runtime();
function AdminOverview() {
	const overview = useQuery({
		queryKey: ["admin-overview"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("admin_overview");
			if (error) throw error;
			return data;
		}
	});
	const perBeat = useQuery({
		queryKey: ["admin-beat-stats"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("admin_beat_stats");
			if (error) throw error;
			return data ?? [];
		}
	});
	if (overview.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Une erreur est survenue",
		description: "Les statistiques du tableau de bord n'ont pas pu être chargées.",
		onRetry: () => void overview.refetch()
	});
	const cards = [
		{
			label: "Beats publiés",
			value: overview.data?.published_beats
		},
		{
			label: "Brouillons",
			value: overview.data?.draft_beats
		},
		{
			label: "Utilisateurs inscrits",
			value: overview.data?.users
		},
		{
			label: "Actifs (30 j)",
			value: overview.data?.active_users
		},
		{
			label: "Pages vues",
			value: overview.data?.views
		},
		{
			label: "Écoutes",
			value: overview.data?.plays
		},
		{
			label: "Favoris",
			value: overview.data?.likes
		},
		{
			label: "Demandes WhatsApp",
			value: overview.data?.whatsapp
		},
		{
			label: "Beats en panier",
			value: overview.data?.cart_items
		}
	];
	const top = [...perBeat.data ?? []].sort((a, b) => b.plays - a.plays).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-dashboard space-y-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "admin-welcome rounded-3xl p-7 sm:p-9",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow text-primary",
						children: "Centre de contrôle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl",
						children: "Votre studio, en un regard."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground",
						children: "Suivez l'activité du catalogue, vos auditeurs et les signaux qui méritent votre attention."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[11px] tracking-[0.25em] text-muted-foreground uppercase",
				children: "Vue d'ensemble"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: cards.map((card, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `admin-metric-card admin-metric-card-${index % 4}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
						children: card.label
					}), overview.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-7 w-16" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display mt-2 text-3xl font-medium",
						children: formatCount(Number(card.value ?? 0))
					})]
				}, card.label))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[11px] tracking-[0.25em] text-muted-foreground uppercase",
				children: "Beats les plus écoutés"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "admin-data-panel mt-5 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-surface text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-normal",
								children: "Beat"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-normal",
								children: "Vues"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-normal",
								children: "Écoutes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-normal",
								children: "Favoris"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-normal",
								children: "Commentaires"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-normal",
								children: "WhatsApp"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: perBeat.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 6,
						className: "px-4 py-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-full" })
					}) }) : top.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 6,
						className: "px-4 py-8 text-center text-muted-foreground",
						children: "Aucune activité enregistrée pour le moment."
					}) }) : top.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: row.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: row.views
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: row.plays
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: row.likes
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: row.comments
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums",
								children: row.whatsapp
							})
						]
					}, row.beat_id)) })]
				})
			})] })
		]
	});
}
//#endregion
export { AdminOverview as component };
