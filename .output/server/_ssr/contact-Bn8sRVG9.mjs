import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { N as Facebook, S as MessageCircle, _ as Phone, k as Instagram, t as Youtube, v as Pencil, w as Mail, x as Music2 } from "../_libs/lucide-react.mjs";
import { t as SiteLayout } from "./SiteLayout-n8TOtS6N.mjs";
import { i as Textarea, n as Input, t as Field } from "./field-C2NZwmZ2.mjs";
import { n as openWhatsapp, t as openEmail } from "./contact-DLBfuZs_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-Bn8sRVG9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var initialState = {
	name: "",
	email: "",
	message: ""
};
function ContactForm({ compact = false, bare = false }) {
	const { data: settings } = useSettings();
	const [form, setForm] = (0, import_react.useState)(initialState);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");
	const emailReady = !!settings?.contact_email;
	const producerName = settings?.producer_name ?? "le producteur";
	function handleSubmit(e) {
		e.preventDefault();
		if (!form.name.trim() || !form.message.trim()) {
			setError("Écrivez votre nom et votre message avant de continuer.");
			return;
		}
		setError(null);
		setReady(true);
	}
	function buildMessage() {
		return [
			`Bonjour ${producerName},`,
			"",
			form.message.trim(),
			"",
			`— ${form.name.trim()}`,
			form.email.trim() ? `(${form.email.trim()})` : null
		].filter(Boolean).join("\n");
	}
	function handleEmail() {
		if (!settings?.contact_email) return;
		openEmail({
			to: settings.contact_email,
			subject: `Message de ${form.name.trim()} — via le site`,
			body: buildMessage()
		});
	}
	function handleWhatsapp() {
		if (!settings?.whatsapp_number) return;
		openWhatsapp({
			phone: settings.whatsapp_number,
			text: buildMessage()
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact || bare ? "" : "panel p-6 sm:p-10",
		children: [!compact && !bare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Contact"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
				children: "Contactez-nous"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-lg text-sm text-muted-foreground",
				children: "Remplissez le formulaire ci-dessous, puis choisissez comment envoyer votre message : par e-mail ou par WhatsApp. Votre texte reste conservé, il ne vous restera qu'à appuyer sur envoyer."
			})
		] }) : compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow",
			children: "Contact"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-display mt-2 text-xl font-semibold tracking-tight",
			children: "Une question ?"
		})] }) : null, !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "mt-6 max-w-md space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Votre nom",
					htmlFor: "contact-name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "contact-name",
						value: form.name,
						onChange: (e) => setForm((f) => ({
							...f,
							name: e.target.value
						})),
						maxLength: 80,
						required: true,
						placeholder: "Votre nom"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Votre e-mail (optionnel)",
					htmlFor: "contact-email",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "contact-email",
						type: "email",
						value: form.email,
						onChange: (e) => setForm((f) => ({
							...f,
							email: e.target.value
						})),
						maxLength: 120,
						placeholder: "vous@exemple.com"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Votre message",
					htmlFor: "contact-message",
					error,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "contact-message",
						rows: 4,
						value: form.message,
						onChange: (e) => setForm((f) => ({
							...f,
							message: e.target.value
						})),
						maxLength: 1e3,
						required: true,
						placeholder: "Écrivez votre message ici…"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "lg",
					children: "Continuer"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 max-w-md space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl bg-surface p-4 text-sm ring-1 ring-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "whitespace-pre-line text-muted-foreground",
						children: buildMessage()
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Choisissez comment envoyer ce message :"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
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
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setReady(false),
					className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
						className: "size-3",
						"aria-hidden": "true"
					}), "Modifier le message"]
				})
			]
		})]
	});
}
function ContactPage() {
	const { data: settings } = useSettings();
	const phone = settings?.whatsapp_number || "+212 6 00 00 00 00";
	const email = settings?.contact_email || "hello@danybeats.com";
	const socials = [
		{
			label: "YouTube",
			value: settings?.youtube_url || "youtube.com/@danybeats",
			icon: Youtube
		},
		{
			label: "Instagram",
			value: settings?.instagram_url || "instagram.com/danybeats",
			icon: Instagram
		},
		{
			label: "TikTok",
			value: settings?.tiktok_url || "tiktok.com/@danybeats",
			icon: Music2
		},
		{
			label: "Facebook",
			value: "facebook.com/danybeats",
			icon: Facebook
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "contact-page mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "contact-intro max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow text-primary",
					children: "Parlons de votre prochain morceau"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-5 text-5xl font-semibold leading-[0.95] tracking-tighter sm:text-7xl",
					children: "Une idée, un besoin, un son à construire."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-xl text-base leading-relaxed text-muted-foreground",
					children: "Écrivez directement au producteur. Que vous cherchiez une licence, un beat sur mesure ou simplement une réponse, chaque message arrive au bon endroit."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "contact-panel contact-panel-main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow text-primary",
							children: "Contact"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-5 text-3xl font-semibold tracking-tight sm:text-4xl",
						children: "Contactez-nous"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground",
						children: "Votre nom, votre e-mail, votre message. On s'occupe du reste."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactForm, { bare: true })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "contact-panel contact-panel-info",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow text-primary",
						children: "Les coordonnées"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-5 text-3xl font-semibold tracking-tight",
						children: "Restons en contact."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm leading-relaxed text-muted-foreground",
						children: "Besoin d'une réponse rapide ? Retrouvez toutes les portes d'entrée vers le studio."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid gap-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `mailto:${email}`,
							className: "contact-detail",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "E-mail" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: email })] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `tel:${phone.replace(/\s/g, "")}`,
							className: "contact-detail",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Téléphone / WhatsApp" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: phone })] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 border-t border-border pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Réseaux"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 grid gap-3",
							children: socials.map(({ label, value, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: value.startsWith("http") ? value : `https://${value}`,
								target: "_blank",
								rel: "noreferrer noopener",
								className: "social-link",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto text-muted-foreground",
										children: "↗"
									})
								]
							}, label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 rounded-2xl bg-primary p-5 text-primary-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 font-display text-xl font-semibold",
								children: "Un beat vous attend peut-être déjà."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/beats",
								className: "mt-4 inline-flex text-sm font-medium underline underline-offset-4",
								children: "Explorer le catalogue"
							})
						]
					})
				]
			})]
		})]
	}) });
}
//#endregion
export { ContactPage as component };
