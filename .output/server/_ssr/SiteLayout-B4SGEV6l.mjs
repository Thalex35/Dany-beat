import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { r as useAuth } from "./auth-Cua3bUdT.mjs";
import { t as track } from "./analytics-CloptECG.mjs";
import { n as usePlayer } from "./player-B0FuGydA.mjs";
import { C as Menu, g as Play, l as ShoppingCart, m as RotateCcw, n as X, r as Volume2, y as Pause } from "../_libs/lucide-react.mjs";
import { t as Cover } from "./Cover-mk6eKWWi.mjs";
import { a as Spinner } from "./states-BmQ6RF0h.mjs";
import { o as formatTime, t as BEAT_COLUMNS } from "./beats-BosAjMsc.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteLayout-B4SGEV6l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Ids des beats présents dans le panier de l'utilisateur connecté (léger, pour badge + bouton). */
function useCartIds() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["cart-ids", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("cart_items").select("beat_id").eq("user_id", user.id);
			if (error) throw error;
			return (data ?? []).map((r) => r.beat_id);
		}
	});
}
/** Contenu complet du panier (beats détaillés) pour la page /panier. */
function useCartBeats() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["cart-beats", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data: items, error } = await supabase.from("cart_items").select("beat_id").eq("user_id", user.id).order("created_at", { ascending: false });
			if (error) throw error;
			const ids = (items ?? []).map((i) => i.beat_id);
			if (!ids.length) return [];
			const { data, error: beatsError } = await supabase.from("beats").select(BEAT_COLUMNS).in("id", ids);
			if (beatsError) throw beatsError;
			const beats = data ?? [];
			return ids.map((id) => beats.find((b) => b.id === id)).filter((b) => !!b);
		}
	});
}
function useToggleCart() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ beatId, inCart }) => {
			if (!user) throw new Error("auth");
			if (inCart) {
				const { error } = await supabase.from("cart_items").delete().eq("beat_id", beatId).eq("user_id", user.id);
				if (error) throw error;
				track("cart_remove", { beatId });
			} else {
				const { error } = await supabase.from("cart_items").insert({
					beat_id: beatId,
					user_id: user.id
				});
				if (error && error.code !== "23505") throw error;
				track("cart_add", { beatId });
			}
		},
		onError: () => toast.error("Le panier n'a pas pu être mis à jour. Réessayez."),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["cart-ids", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["cart-beats", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["admin-cart"] });
			queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
		}
	});
}
var links = [
	{
		to: "/",
		label: "Accueil"
	},
	{
		to: "/beats",
		label: "Beats"
	},
	{
		to: "/about",
		label: "À propos"
	},
	{
		to: "/contact",
		label: "Contact"
	}
];
function Header() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { user, isAdmin, profile } = useAuth();
	const { data: settings } = useSettings();
	const { data: cartIds } = useCartIds();
	const cartCount = cartIds?.length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "font-display text-xl font-semibold tracking-tighter uppercase",
					children: settings?.producer_name ?? "Dany Beats"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Navigation principale",
					className: "hidden items-center gap-8 md:flex",
					children: links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: l.to,
						className: "text-sm text-muted-foreground transition-colors hover:text-foreground",
						activeProps: { className: "text-foreground" },
						activeOptions: { exact: l.to === "/" },
						children: l.label
					}, l.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden items-center gap-2 md:flex",
					children: [isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							children: "Administration"
						})
					}) : null, user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "surface",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/profile",
							children: profile?.display_name ?? "Mon compte"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						className: "relative",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/cart",
							"aria-label": "Voir le panier",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {}),
								"Panier",
								cartCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground",
									children: cartCount
								}) : null
							]
						})
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							children: "Connexion"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "grid size-9 place-items-center rounded-full ring-1 ring-border md:hidden",
					"aria-label": open ? "Fermer le menu" : "Ouvrir le menu",
					"aria-expanded": open,
					onClick: () => setOpen((v) => !v),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border bg-background px-5 py-4 md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Navigation mobile",
				className: "flex flex-col gap-1",
				children: [
					links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: l.to,
						onClick: () => setOpen(false),
						className: "rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground",
						children: l.label
					}, l.to)),
					isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin",
						onClick: () => setOpen(false),
						className: "rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground",
						children: "Administration"
					}) : null,
					user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/profile",
						onClick: () => setOpen(false),
						className: "rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground",
						children: "Mon compte"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/cart",
						onClick: () => setOpen(false),
						className: "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {
								className: "size-4",
								"aria-hidden": "true"
							}),
							"Panier",
							cartCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground",
								children: cartCount
							}) : null
						]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						onClick: () => setOpen(false),
						className: "mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground",
						children: "Connexion"
					})
				]
			})
		}) : null]
	});
}
function PlayerBar() {
	const { current, playing, finished, loading, error, progress, duration, volume, toggle, seek, setVolume, stop } = usePlayer();
	if (!current) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl rounded-2xl bg-surface/95 p-3 shadow-2xl ring-1 ring-border backdrop-blur-xl sm:p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 sm:gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/beats/$slug",
							params: { slug: current.slug },
							className: "shrink-0",
							"aria-label": `Ouvrir ${current.title}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
								path: current.coverPath,
								alt: "",
								className: "size-10 rounded-lg sm:size-12"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: current.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-[10px] text-muted-foreground",
								children: [current.bpm ? `${current.bpm} BPM • ` : "", "Extrait"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden items-center gap-2 sm:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
								className: "size-4 text-muted-foreground",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 1,
								step: .05,
								value: volume,
								"aria-label": "Volume",
								onChange: (e) => setVolume(Number(e.target.value)),
								className: "h-1 w-20 accent-[var(--primary)]"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => toggle(),
							"aria-label": finished ? "Rejouer l'extrait" : playing ? "Mettre l'extrait en pause" : "Écouter l'extrait",
							className: "grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}) : finished ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }) : playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: stop,
							"aria-label": "Fermer le player",
							className: "grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-9 text-[10px] tabular-nums text-muted-foreground",
							children: formatTime(progress)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: duration || 0,
							step: .1,
							value: progress,
							"aria-label": "Position de lecture",
							onChange: (e) => seek(Number(e.target.value)),
							className: "h-1 flex-1 accent-[var(--primary)]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-9 text-right text-[10px] tabular-nums text-muted-foreground",
							children: formatTime(duration)
						})
					]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-destructive",
					children: error
				}) : null
			]
		})
	});
}
function Footer() {
	const { data: settings } = useSettings();
	const socials = [
		{
			url: settings?.instagram_url,
			label: "Instagram"
		},
		{
			url: settings?.youtube_url,
			label: "YouTube"
		},
		{
			url: settings?.tiktok_url,
			label: "TikTok"
		}
	].filter((s) => !!s.url);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "site-footer mt-24 px-5 py-12 sm:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-10 border-b border-border pb-12 md:grid-cols-[1.3fr_1fr_1fr]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow text-primary",
						children: "Dany Beats"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display mt-3 max-w-sm text-3xl font-semibold tracking-tight",
						children: "Des sons qui donnent une direction à vos idées."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground",
						children: "Instrumentales originales, licences claires et contact direct avec le producteur."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Navigation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "mt-4 grid gap-3 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "transition-colors hover:text-foreground",
							children: "Accueil"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/beats",
							className: "transition-colors hover:text-foreground",
							children: "Catalogue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/about",
							className: "transition-colors hover:text-foreground",
							children: "À propos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contact",
							className: "transition-colors hover:text-foreground",
							children: "Contact"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Parlons musique"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 text-sm text-muted-foreground",
					children: [
						settings?.contact_email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `mailto:${settings.contact_email}`,
							className: "transition-colors hover:text-primary",
							children: settings.contact_email
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "hello@danybeats.com" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: settings?.whatsapp_number ? `tel:${settings.whatsapp_number}` : "tel:+212600000000",
							className: "transition-colors hover:text-primary",
							children: settings?.whatsapp_number || "+212 6 00 00 00 00"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-4 pt-2",
							children: socials.length ? socials.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: s.url,
								target: "_blank",
								rel: "noreferrer noopener",
								className: "transition-colors hover:text-primary",
								children: s.label
							}, s.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									className: "hover:text-primary",
									children: "YouTube"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									className: "hover:text-primary",
									children: "TikTok"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									className: "hover:text-primary",
									children: "Facebook"
								})
							] })
						})
					]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-sm tracking-tighter uppercase",
				children: settings?.producer_name ?? "Dany Beats"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" — Instrumentales originales, sous licence pour les artistes."
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" Dany Beats. Tous droits réservés."
			] })]
		})]
	});
}
function SiteLayout({ children }) {
	const { current } = usePlayer();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: current ? "flex-1 pb-40" : "flex-1 pb-10",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerBar, {})
		]
	});
}
//#endregion
export { useToggleCart as i, useCartBeats as n, useCartIds as r, SiteLayout as t };
