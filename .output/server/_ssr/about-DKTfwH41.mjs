import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as useSignedUrl } from "./media-C1QoYJjN.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { S as MessageCircle, w as Mail } from "../_libs/lucide-react.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteLayout } from "./SiteLayout-n8TOtS6N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-DKTfwH41.js
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_BIO = `Dany est producteur, beatmaker et ingénieur du son. Depuis dix ans, il façonne des instrumentales rap, trap, drill et afro pour des artistes indépendants.
Tout est écrit, arrangé et mixé dans son studio : choix des sons, design des drums, basse, mix final. Chaque beat est livré prêt pour l'enregistrement.`;
var highlights = [
	{
		label: "Années de production",
		value: "10+"
	},
	{
		label: "Projets accompagnés",
		value: "120+"
	},
	{
		label: "Styles",
		value: "Rap · Trap · Drill · Afro · R&B"
	}
];
function AboutPage() {
	const { data: settings } = useSettings();
	const whatsapp = settings?.whatsapp_number?.replace(/\D/g, "");
	const bio = settings?.producer_bio?.trim() ? settings.producer_bio : DEFAULT_BIO;
	const photo = useSignedUrl("site-assets", settings?.producer_photo_path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photo.data ?? "/assets/producer-dany-1-82CYpm.jpg",
				alt: `Portrait de ${settings?.producer_name ?? "Dany"} en studio`,
				width: 1024,
				height: 1280,
				className: "w-full rounded-3xl object-cover ring-1 ring-border"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.3em] text-primary uppercase",
					children: "Le producteur"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-5 text-4xl font-semibold tracking-tighter sm:text-6xl",
					children: settings?.producer_name ?? "Dany Beats"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 space-y-5 text-base leading-relaxed text-muted-foreground",
					children: bio.split("\n").filter(Boolean).map((paragraph, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: paragraph }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "mt-10 grid gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-3",
					children: highlights.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-background px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
							children: h.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1.5 text-sm font-medium",
							children: h.value
						})]
					}, h.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/beats",
								children: "Écouter le catalogue"
							})
						}),
						whatsapp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "whatsapp",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `https://wa.me/${whatsapp}`,
								target: "_blank",
								rel: "noreferrer noopener",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {}), "Écrire sur WhatsApp"]
							})
						}) : null,
						settings?.contact_email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `mailto:${settings.contact_email}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {}), "Envoyer un e-mail"]
							})
						}) : null
					]
				})
			] })]
		})
	}) });
}
//#endregion
export { AboutPage as component };
