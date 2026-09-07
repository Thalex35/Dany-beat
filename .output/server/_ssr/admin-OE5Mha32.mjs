import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { n as signOut, r as useAuth } from "./auth-Cua3bUdT.mjs";
import { O as LayoutDashboard, P as ExternalLink, T as LogOut, b as Music4, d as Settings, i as Users, l as ShoppingCart } from "../_libs/lucide-react.mjs";
import { a as Spinner, n as EmptyState } from "./states-BmQ6RF0h.mjs";
import { d as Outlet, g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-OE5Mha32.js
var import_jsx_runtime = require_jsx_runtime();
var tabs = [
	{
		to: "/admin",
		label: "Tableau de bord",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/admin/beats",
		label: "Beats",
		icon: Music4,
		exact: false
	},
	{
		to: "/admin/cart",
		label: "Panier",
		icon: ShoppingCart,
		exact: false
	},
	{
		to: "/admin/users",
		label: "Utilisateurs",
		icon: Users,
		exact: false
	},
	{
		to: "/admin/settings",
		label: "Paramètres",
		icon: Settings,
		exact: false
	}
];
function ClaimAdmin() {
	const queryClient = useQueryClient();
	const adminExists = useQuery({
		queryKey: ["admin-exists"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("admin_exists");
			if (error) throw error;
			return Boolean(data);
		}
	});
	const claim = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.rpc("claim_first_admin");
			if (error) throw error;
		},
		onSuccess: async () => {
			toast.success("Vous êtes désormais l'administrateur du site");
			await queryClient.invalidateQueries({ queryKey: ["me"] });
			await queryClient.invalidateQueries({ queryKey: ["admin-exists"] });
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "L'accès administrateur n'a pas pu être accordé.")
	});
	if (adminExists.isPending || adminExists.data !== false) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 rounded-2xl bg-surface p-6 text-center ring-1 ring-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Aucun compte producteur n'a encore été créé. Revendiquez-le une seule fois avec ce compte : ensuite, seuls les administrateurs existants pourront accorder ce rôle."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			disabled: claim.isPending,
			onClick: () => claim.mutate(),
			children: claim.isPending ? "Attribution…" : "Devenir administrateur"
		})]
	});
}
function AdminLayout() {
	const { isAdmin, loading, roleLoading } = useAuth();
	const { data: settings } = useSettings();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	async function handleSignOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await signOut();
		navigate({
			to: "/",
			replace: true
		});
	}
	if (loading || roleLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, { className: "size-6" })
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-5 py-24 sm:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Accès administrateur requis",
			description: "Cet espace est réservé au compte du producteur.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Retour au site"
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimAdmin, {})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-shell min-h-screen bg-background md:grid md:grid-cols-[16rem_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "border-b border-border bg-surface md:sticky md:top-0 md:h-screen md:border-r md:border-b-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full flex-col px-5 py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-semibold tracking-tighter uppercase",
						children: settings?.producer_name ?? "Dany Beats"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[10px] tracking-[0.25em] text-primary uppercase",
						children: "Administration"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						"aria-label": "Navigation administration",
						className: "mt-8 flex flex-col gap-1",
						children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: tab.to,
							activeOptions: { exact: tab.exact },
							className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground",
							activeProps: { className: "bg-background text-foreground" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tab.icon, {
								className: "size-4",
								"aria-hidden": "true"
							}), tab.label]
						}, tab.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-1 border-t border-border pt-4 md:mt-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Voir le site public"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => void handleSignOut(),
							className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-background hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Déconnexion"]
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "min-w-0 px-5 py-10 sm:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-5xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})
		})]
	});
}
//#endregion
export { AdminLayout as component };
