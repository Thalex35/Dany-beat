import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { r as useAuth } from "./auth-Cua3bUdT.mjs";
import { u as ShieldCheck } from "../_libs/lucide-react.mjs";
import { i as Skeleton, r as ErrorState, t as Badge } from "./states-BmQ6RF0h.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.users-Cyvv4swu.js
var import_jsx_runtime = require_jsx_runtime();
function AdminUsers() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const users = useQuery({
		queryKey: ["admin-users"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("admin_users_overview");
			if (error) throw error;
			return data ?? [];
		}
	});
	const setAdmin = useMutation({
		mutationFn: async ({ id, make }) => {
			const { error } = await supabase.rpc("admin_set_admin", {
				_user_id: id,
				_make: make
			});
			if (error) throw error;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			await queryClient.invalidateQueries({ queryKey: ["me"] });
			toast.success("Rôle mis à jour");
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Le rôle n'a pas pu être mis à jour.")
	});
	if (users.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Une erreur est survenue",
		description: "Les utilisateurs n'ont pas pu être chargés.",
		onRetry: () => void users.refetch()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-users-page space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "admin-page-heading",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow text-primary",
					children: "Audience"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-4xl font-semibold tracking-tight",
					children: "Utilisateurs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Suivez vos auditeurs et gérez les accès à l'espace administration."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "admin-page-icon",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "admin-data-panel overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[40rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-surface text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-normal",
							children: "Nom"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-normal",
							children: "E-mail"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-normal",
							children: "Inscription"
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
							children: "Dernière visite"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-normal",
							children: "Rôle"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: users.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 7,
					className: "px-4 py-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-full" })
				}) }) : (users.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 7,
					className: "px-4 py-8 text-center text-muted-foreground",
					children: "Aucun utilisateur inscrit pour le moment."
				}) }) : (users.data ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: u.display_name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: u.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: new Date(u.created_at).toLocaleDateString("fr-FR")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums",
							children: u.likes
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums",
							children: u.comments
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted-foreground",
							children: u.last_seen ? new Date(u.last_seen).toLocaleDateString("fr-FR") : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [u.is_admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Admin" }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									disabled: setAdmin.isPending || u.is_admin && u.id === user?.id,
									onClick: () => setAdmin.mutate({
										id: u.id,
										make: !u.is_admin
									}),
									children: u.is_admin ? "Retirer l'accès admin" : "Nommer admin"
								})]
							})
						})
					]
				}, u.id)) })]
			})
		})]
	});
}
//#endregion
export { AdminUsers as component };
