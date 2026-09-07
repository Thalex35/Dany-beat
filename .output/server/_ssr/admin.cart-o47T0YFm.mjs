import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { w as Mail } from "../_libs/lucide-react.mjs";
import { i as Skeleton, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { i as formatPrice } from "./beats-B5LKfYIS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.cart-o47T0YFm.js
var import_jsx_runtime = require_jsx_runtime();
function AdminCart() {
	const rows = useQuery({
		queryKey: ["admin-cart"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("admin_cart_overview");
			if (error) throw error;
			return data ?? [];
		}
	});
	if (rows.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Une erreur est survenue",
		description: "Le contenu des paniers n'a pas pu être chargé.",
		onRetry: () => void rows.refetch()
	});
	const data = rows.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "admin-page-heading mb-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow text-primary",
				children: "Opportunités"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display mt-2 text-4xl font-semibold tracking-tight",
				children: "Paniers"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Contactez directement les personnes qui ont ajouté des beats à leur panier."
			})
		] })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "admin-data-panel overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[42rem] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-surface text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-normal",
						children: "Client"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-normal",
						children: "Beat"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-normal",
						children: "Prix"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-normal",
						children: "Ajouté le"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-normal",
						children: "Contact"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 5,
				className: "px-4 py-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-full" })
			}) }) : data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 5,
				className: "px-4 py-8 text-center text-muted-foreground",
				children: "Aucun beat n'a encore été ajouté à un panier."
			}) }) : data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: row.display_name ?? "Sans nom"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: row.email ?? "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3",
						children: row.beat_title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 tabular-nums text-primary",
						children: formatPrice(row.price)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 text-muted-foreground",
						children: new Date(row.created_at).toLocaleDateString("fr-FR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3",
						children: row.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `mailto:${row.email}?subject=${encodeURIComponent(`À propos de "${row.beat_title}"`)}`,
							className: "inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
								className: "size-3.5",
								"aria-hidden": "true"
							}), "Contacter"]
						}) : "—"
					})
				]
			}, row.id)) })]
		})
	})] });
}
//#endregion
export { AdminCart as component };
