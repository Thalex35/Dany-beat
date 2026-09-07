import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as fileExtension } from "./media-C1QoYJjN.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { t as settingsQuery } from "./settings-DfgoQbFU.mjs";
import { A as ImagePlus, D as Link2, F as Earth, c as Sparkles, p as Save } from "../_libs/lucide-react.mjs";
import { i as Skeleton, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Textarea, n as Input, t as Field } from "./field-C2NZwmZ2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.settings-CnVoeLbB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var empty = {
	producer_name: "",
	producer_bio: "",
	hero_eyebrow: "Catalogue indépendant",
	hero_title: "Des instrumentales pour les artistes qui prennent leur disque au sérieux.",
	hero_description: "",
	producer_photo_path: null,
	whatsapp_number: "",
	contact_email: "",
	instagram_url: "",
	youtube_url: "",
	tiktok_url: ""
};
function AdminSettings() {
	const queryClient = useQueryClient();
	const settings = useQuery(settingsQuery);
	const [form, setForm] = (0, import_react.useState)(empty);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (settings.data) setForm({
			...settings.data,
			hero_eyebrow: settings.data.hero_eyebrow ?? empty.hero_eyebrow,
			hero_title: settings.data.hero_title ?? empty.hero_title,
			hero_description: settings.data.hero_description ?? "",
			producer_photo_path: settings.data.producer_photo_path ?? null,
			instagram_url: settings.data.instagram_url ?? "",
			youtube_url: settings.data.youtube_url ?? "",
			tiktok_url: settings.data.tiktok_url ?? ""
		});
	}, [settings.data]);
	async function uploadPhoto(file) {
		setUploading(true);
		try {
			const extension = fileExtension(file.name) || "jpg";
			const path = `producer/${crypto.randomUUID()}.${extension}`;
			const { error } = await supabase.storage.from("site-assets").upload(path, file);
			if (error) throw error;
			setForm((prev) => ({
				...prev,
				producer_photo_path: path
			}));
			toast.success("Photo importée");
		} catch {
			toast.error("La photo n'a pas pu être importée.");
		} finally {
			setUploading(false);
		}
	}
	const save = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("site_settings").update({
				producer_name: form.producer_name.trim(),
				producer_bio: form.producer_bio,
				hero_eyebrow: form.hero_eyebrow.trim(),
				hero_title: form.hero_title.trim(),
				hero_description: form.hero_description.trim(),
				producer_photo_path: form.producer_photo_path,
				whatsapp_number: form.whatsapp_number.trim(),
				contact_email: form.contact_email.trim(),
				instagram_url: form.instagram_url?.trim() || null,
				youtube_url: form.youtube_url?.trim() || null,
				tiktok_url: form.tiktok_url?.trim() || null
			}).eq("id", true);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["site-settings"] });
			toast.success("Paramètres enregistrés");
		},
		onError: () => toast.error("Les paramètres n'ont pas pu être enregistrés.")
	});
	if (settings.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 w-full max-w-xl" });
	if (settings.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Une erreur est survenue",
		description: "Les paramètres n'ont pas pu être chargés.",
		onRetry: () => void settings.refetch()
	});
	const set = (key) => (value) => setForm((prev) => ({
		...prev,
		[key]: value
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "admin-settings space-y-8",
		onSubmit: (e) => {
			e.preventDefault();
			save.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "admin-page-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow text-primary",
						children: "Identité du site"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl font-semibold tracking-tight",
						children: "Paramètres"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground",
						children: "Façonnez la présence de Dany Beats. Chaque modification est visible sur le site public."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "admin-settings-status",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-success" }), " Site connecté"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "admin-settings-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "admin-section-label",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Identité du producteur" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-6 md:grid-cols-[1fr_0.8fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom du producteur",
							htmlFor: "producer_name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "producer_name",
								value: form.producer_name,
								onChange: (e) => set("producer_name")(e.target.value),
								required: true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Biographie",
							htmlFor: "producer_bio",
							hint: "Affichée sur l'accueil et la page À propos.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "producer_bio",
								rows: 5,
								value: form.producer_bio,
								onChange: (e) => set("producer_bio")(e.target.value)
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "admin-photo-drop",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-7 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-medium",
								children: "Portrait du producteur"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "JPG, PNG ou WebP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90",
								children: ["Importer une photo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "producer_photo",
									type: "file",
									accept: "image/jpeg,image/png,image/webp",
									className: "sr-only",
									disabled: uploading,
									onChange: (e) => {
										const file = e.target.files?.[0];
										if (file) uploadPhoto(file);
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 truncate text-xs text-muted-foreground",
								children: form.producer_photo_path ? "Photo prête à être enregistrée" : "Aucune photo personnalisée"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "admin-settings-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "admin-section-label",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Accueil public" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Petit titre",
							htmlFor: "hero_eyebrow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "hero_eyebrow",
								value: form.hero_eyebrow,
								onChange: (e) => set("hero_eyebrow")(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Titre principal",
							htmlFor: "hero_title",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "hero_title",
								rows: 3,
								value: form.hero_title,
								onChange: (e) => set("hero_title")(e.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description d'accueil",
							htmlFor: "hero_description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "hero_description",
								rows: 3,
								value: form.hero_description,
								onChange: (e) => set("hero_description")(e.target.value)
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "admin-settings-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "admin-section-label",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact et réseaux" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-5 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Numéro WhatsApp",
							htmlFor: "whatsapp_number",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "whatsapp_number",
								value: form.whatsapp_number,
								onChange: (e) => set("whatsapp_number")(e.target.value),
								placeholder: "+212600000000"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "E-mail de contact",
							htmlFor: "contact_email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "contact_email",
								type: "email",
								value: form.contact_email,
								onChange: (e) => set("contact_email")(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid gap-5 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Instagram",
								htmlFor: "instagram_url",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "instagram_url",
									value: form.instagram_url ?? "",
									onChange: (e) => set("instagram_url")(e.target.value),
									placeholder: "https://"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "YouTube",
								htmlFor: "youtube_url",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "youtube_url",
									value: form.youtube_url ?? "",
									onChange: (e) => set("youtube_url")(e.target.value),
									placeholder: "https://"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "TikTok",
								htmlFor: "tiktok_url",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "tiktok_url",
									value: form.tiktok_url ?? "",
									onChange: (e) => set("tiktok_url")(e.target.value),
									placeholder: "https://"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "admin-save-button",
				type: "submit",
				disabled: save.isPending,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}), save.isPending ? "Enregistrement…" : "Enregistrer les paramètres"]
			})
		]
	});
}
//#endregion
export { AdminSettings as component };
