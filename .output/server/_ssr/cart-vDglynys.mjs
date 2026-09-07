import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { r as useAuth } from "./auth-Cua3bUdT.mjs";
import { C as MessageCircle, T as Mail, l as ShoppingCart, s as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Cover } from "./Cover-mk6eKWWi.mjs";
import { i as Skeleton, n as EmptyState, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { a as formatPrice } from "./beats-BosAjMsc.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useToggleCart, n as useCartBeats, t as SiteLayout } from "./SiteLayout-DqeSBX0E.mjs";
import { n as openWhatsapp, t as openEmail } from "./contact-DLBfuZs_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-vDglynys.js
var import_jsx_runtime = require_jsx_runtime();
function buildCartMessage(params) {
	return [
		`Bonjour ${params.producerName}, je suis intéressé(e) par les beats suivants dans mon panier :`,
		"",
		...params.beats.map((b) => `• ${b.title} — ${formatPrice(b.price)}`),
		"",
		`Total estimé : ${formatPrice(params.total)}`,
		"",
		`Mon nom : ${params.buyerName}`,
		"J'aimerais connaître les licences disponibles et les moyens de paiement."
	].join("\n");
}
function CartPage() {
	const { profile, user } = useAuth();
	const { data: settings } = useSettings();
	const beats = useCartBeats();
	const toggle = useToggleCart();
	const list = beats.data ?? [];
	const total = list.reduce((sum, b) => sum + Number(b.price ?? 0), 0);
	const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");
	const emailReady = !!settings?.contact_email;
	const buyerName = profile?.display_name ?? user?.email ?? "Un visiteur";
	function handleEmail() {
		if (!settings?.contact_email) return;
		openEmail({
			to: settings.contact_email,
			subject: `Panier de ${buyerName} — ${list.length} beat(s)`,
			body: buildCartMessage({
				buyerName,
				beats: list,
				total,
				producerName: settings?.producer_name ?? "le producteur"
			})
		});
	}
	function handleWhatsapp() {
		if (!settings?.whatsapp_number) return;
		openWhatsapp({
			phone: settings.whatsapp_number,
			text: buildCartMessage({
				buyerName,
				beats: list,
				total,
				producerName: settings?.producer_name ?? "le producteur"
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "public-account-page mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "public-page-heading",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display flex items-center gap-3 text-4xl font-semibold tracking-tighter",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {
					className: "size-8",
					"aria-hidden": "true"
				}), "Mon panier"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "Vos sélections sont conservées ici, prêtes pour votre prochaine session studio."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10",
			children: beats.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" })]
			}) : beats.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Une erreur est survenue",
				description: "Votre panier n'a pas pu être chargé.",
				onRetry: () => void beats.refetch()
			}) : list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Votre panier est vide",
				description: "Ajoutez des beats depuis le catalogue pour les retrouver ici.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/beats",
						children: "Voir le catalogue"
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "premium-list divide-y divide-border rounded-2xl ring-1 ring-border",
					children: list.map((beat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-4 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
								path: beat.cover_path,
								alt: `Pochette de ${beat.title}`,
								className: "size-16 shrink-0 rounded-xl"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/beats/$slug",
									params: { slug: beat.slug },
									className: "truncate text-sm font-medium hover:text-primary",
									children: beat.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: [beat.genre, beat.mood].filter(Boolean).join(" • ") || "Instrumentale"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display shrink-0 font-medium text-primary",
								children: formatPrice(beat.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Retirer ${beat.title} du panier`,
								disabled: toggle.isPending,
								onClick: () => toggle.mutate({
									beatId: beat.id,
									inCart: true
								}),
								className: "grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-destructive disabled:opacity-50",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									className: "size-4",
									"aria-hidden": "true"
								})
							})
						]
					}, beat.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "premium-total mt-6 flex items-center justify-between rounded-2xl p-5 ring-1 ring-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: "Total estimé"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl font-medium text-primary",
						children: formatPrice(total)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "premium-checkout mt-8 rounded-3xl p-6 ring-1 ring-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Envoyez le contenu de votre panier au producteur pour finaliser votre commande. Votre message sera prérempli, il ne vous restera qu'à appuyer sur envoyer."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							disabled: !emailReady,
							onClick: handleEmail,
							title: emailReady ? void 0 : "E-mail non configuré",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {}), "Envoyer par e-mail"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "whatsapp",
							size: "lg",
							disabled: !whatsappReady,
							onClick: handleWhatsapp,
							title: whatsappReady ? void 0 : "WhatsApp non configuré",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {}), "Envoyer par WhatsApp"]
						})]
					})]
				})
			] })
		})]
	}) });
}
//#endregion
export { CartPage as component };
