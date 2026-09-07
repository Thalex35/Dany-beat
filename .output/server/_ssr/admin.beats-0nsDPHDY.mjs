import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, d as DialogClose, f as DialogContent$1, g as DialogTitle$1, h as DialogPortal$1, m as DialogOverlay$1, p as DialogDescription$1, u as Dialog$1, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as fileExtension } from "./media-C1QoYJjN.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { r as useAuth } from "./auth-Cua3bUdT.mjs";
import { n as usePlayer } from "./player-B0FuGydA.mjs";
import { a as Upload, g as Play, h as Plus, n as X, s as Trash2, v as Pencil, y as Pause } from "../_libs/lucide-react.mjs";
import { t as Cover } from "./Cover-mk6eKWWi.mjs";
import { i as Skeleton, n as EmptyState, r as ErrorState, t as Badge } from "./states-BmQ6RF0h.mjs";
import { a as formatPrice, c as slugify, t as BEAT_COLUMNS } from "./beats-BosAjMsc.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as ConfirmDialog } from "./confirm-DHdPtoX_.mjs";
import { i as Textarea, n as Input, r as Select, t as Field } from "./field-C2NZwmZ2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.beats-0nsDPHDY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var blankForm = {
	id: null,
	title: "",
	slug: "",
	description: "",
	genre: "",
	mood: "",
	bpm: "",
	song_key: "",
	price: "0",
	tags: "",
	status: "draft",
	featured: false,
	licenses: [{
		id: "mp3",
		name: "Licence MP3",
		price: 25,
		files: "MP3 taggé 320 kbps"
	}],
	cover_path: null,
	preview_path: null,
	master_path: null
};
function toForm(beat) {
	return {
		id: beat.id,
		title: beat.title,
		slug: beat.slug,
		description: beat.description ?? "",
		genre: beat.genre ?? "",
		mood: beat.mood ?? "",
		bpm: beat.bpm ? String(beat.bpm) : "",
		song_key: beat.song_key ?? "",
		price: String(beat.price ?? 0),
		tags: (beat.tags ?? []).join(", "),
		status: beat.status,
		featured: beat.featured,
		licenses: Array.isArray(beat.licenses) && beat.licenses.length ? beat.licenses : [],
		cover_path: beat.cover_path,
		preview_path: beat.preview_path,
		master_path: beat.master_path
	};
}
async function uploadTo(bucket, file, slug) {
	const ext = fileExtension(file.name) || (bucket === "covers" ? "jpg" : "mp3");
	const path = `${slug || "beat"}/${crypto.randomUUID()}.${ext}`;
	const { error } = await supabase.storage.from(bucket).upload(path, file, {
		upsert: false,
		contentType: file.type || void 0,
		cacheControl: "3600"
	});
	if (error) throw error;
	return path;
}
function AdminBeats() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(null);
	const [selectedBeat, setSelectedBeat] = (0, import_react.useState)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const { current, playing, toggle } = usePlayer();
	const beats = useQuery({
		queryKey: ["admin-beats"],
		queryFn: async () => {
			const { data, error } = await supabase.from("beats").select(BEAT_COLUMNS).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const filteredBeats = (0, import_react.useMemo)(() => {
		const query = search.trim().toLowerCase();
		if (!query) return beats.data ?? [];
		return (beats.data ?? []).filter((beat) => [
			beat.title,
			beat.slug,
			beat.genre,
			beat.mood,
			...beat.tags ?? []
		].filter(Boolean).some((value) => value.toLowerCase().includes(query)));
	}, [beats.data, search]);
	const save = useMutation({
		mutationFn: async (state) => {
			const payload = {
				title: state.title.trim(),
				slug: state.slug.trim() || slugify(state.title),
				description: state.description.trim() || null,
				genre: state.genre.trim() || null,
				mood: state.mood.trim() || null,
				bpm: state.bpm ? Number(state.bpm) : null,
				song_key: state.song_key.trim() || null,
				price: Number(state.price || 0),
				tags: state.tags.split(",").map((t) => t.trim()).filter(Boolean),
				licenses: state.licenses,
				status: state.status,
				featured: state.featured,
				cover_path: state.cover_path,
				preview_path: state.preview_path,
				master_path: state.master_path,
				published_at: state.status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : null
			};
			if (state.id) {
				const { error } = await supabase.from("beats").update(payload).eq("id", state.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("beats").insert({
					...payload,
					created_by: user.id
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-beats"] });
			queryClient.invalidateQueries({ queryKey: ["beats", "published"] });
			setForm(null);
			toast.success("Beat enregistré");
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Le beat n'a pas pu être enregistré.")
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("beats").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-beats"] });
			queryClient.invalidateQueries({ queryKey: ["beats", "published"] });
			toast.success("Beat supprimé");
		},
		onError: () => toast.error("Le beat n'a pas pu être supprimé.")
	});
	async function handleUpload(bucket, file) {
		if (!form) return;
		setUploading(true);
		try {
			const path = await uploadTo(bucket, file, form.slug || slugify(form.title));
			setForm((prev) => prev ? {
				...prev,
				...bucket === "covers" ? { cover_path: path } : bucket === "previews" ? { preview_path: path } : { master_path: path }
			} : prev);
			toast.success("Fichier importé");
		} catch {
			toast.error("L'import a échoué. Vérifiez la taille du fichier et réessayez.");
		} finally {
			setUploading(false);
		}
	}
	if (beats.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Une erreur est survenue",
		description: "Les beats n'ont pas pu être chargés.",
		onRetry: () => void beats.refetch()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-beats-page space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "admin-page-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow text-primary",
						children: "Bibliothèque studio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl font-semibold tracking-tight",
						children: "Beats"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: [
							beats.data?.length ?? 0,
							" beat",
							(beats.data?.length ?? 0) === 1 ? "" : "s",
							" au catalogue"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setForm(blankForm),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Nouveau beat"]
				})]
			}),
			form ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "admin-editor-panel rounded-3xl p-6",
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate(form);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "admin-section-label",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.id ? "Modifier le beat" : "Nouveau beat" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-5 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Titre",
								htmlFor: "title",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "title",
									required: true,
									value: form.title,
									onChange: (e) => setForm({
										...form,
										title: e.target.value,
										slug: form.id ? form.slug : slugify(e.target.value)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Slug",
								htmlFor: "slug",
								hint: "Utilisé dans l'adresse de la page du beat.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "slug",
									required: true,
									value: form.slug,
									onChange: (e) => setForm({
										...form,
										slug: slugify(e.target.value)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Genre",
								htmlFor: "genre",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "genre",
									value: form.genre,
									onChange: (e) => setForm({
										...form,
										genre: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Ambiance",
								htmlFor: "mood",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "mood",
									value: form.mood,
									onChange: (e) => setForm({
										...form,
										mood: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "BPM",
								htmlFor: "bpm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "bpm",
									type: "number",
									min: 20,
									max: 400,
									value: form.bpm,
									onChange: (e) => setForm({
										...form,
										bpm: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Tonalité",
								htmlFor: "song_key",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "song_key",
									value: form.song_key,
									onChange: (e) => setForm({
										...form,
										song_key: e.target.value
									}),
									placeholder: "Fa# mineur"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Prix de base (USD)",
								htmlFor: "price",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "price",
									type: "number",
									min: 0,
									step: "0.01",
									value: form.price,
									onChange: (e) => setForm({
										...form,
										price: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Tags",
								htmlFor: "tags",
								hint: "Séparés par des virgules.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "tags",
									value: form.tags,
									onChange: (e) => setForm({
										...form,
										tags: e.target.value
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							htmlFor: "description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "description",
								rows: 4,
								value: form.description,
								onChange: (e) => setForm({
									...form,
									description: e.target.value
								})
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "mt-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-[11px] tracking-[0.25em] text-muted-foreground uppercase",
							children: "Licences"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [form.licenses.map((license, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-[1fr_8rem_1fr_auto]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "Nom de la licence",
										value: license.name,
										onChange: (e) => {
											const next = [...form.licenses];
											next[i] = {
												...license,
												name: e.target.value
											};
											setForm({
												...form,
												licenses: next
											});
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "Prix de la licence",
										type: "number",
										min: 0,
										step: "0.01",
										value: license.price,
										onChange: (e) => {
											const next = [...form.licenses];
											next[i] = {
												...license,
												price: Number(e.target.value)
											};
											setForm({
												...form,
												licenses: next
											});
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "Fichiers inclus",
										value: license.files ?? "",
										placeholder: "WAV + stems",
										onChange: (e) => {
											const next = [...form.licenses];
											next[i] = {
												...license,
												files: e.target.value
											};
											setForm({
												...form,
												licenses: next
											});
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "iconSm",
										"aria-label": "Supprimer la licence",
										onClick: () => setForm({
											...form,
											licenses: form.licenses.filter((_, j) => j !== i)
										}),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
									})
								]
							}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => setForm({
									...form,
									licenses: [...form.licenses, {
										id: crypto.randomUUID(),
										name: "",
										price: 0,
										files: ""
									}]
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Ajouter une licence"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "mt-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-[11px] tracking-[0.25em] text-muted-foreground uppercase",
								children: "Fichiers du beat"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-4 sm:grid-cols-3",
								children: [
									{
										bucket: "covers",
										label: "Pochette",
										accept: "image/*",
										path: form.cover_path,
										hint: "JPG ou PNG carré"
									},
									{
										bucket: "previews",
										label: "Extrait audio",
										accept: "audio/*",
										path: form.preview_path,
										hint: "MP3 taggé, écoutable publiquement"
									},
									{
										bucket: "masters",
										label: "Master / stems",
										accept: "audio/*,.zip,.rar",
										path: form.master_path,
										hint: "Privé, jamais public"
									}
								].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl bg-background p-4 ring-1 ring-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: slot.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: slot.hint
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
													className: "size-4",
													"aria-hidden": "true"
												}),
												slot.path ? "Remplacer le fichier" : "Importer un fichier",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: slot.accept,
													className: "sr-only",
													disabled: uploading,
													onChange: (e) => {
														const file = e.target.files?.[0];
														if (file) handleUpload(slot.bucket, file);
														e.target.value = "";
													}
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 truncate text-xs text-muted-foreground",
											title: slot.path ?? "",
											children: slot.path ? `Importé : ${slot.path.split("/").pop()}` : "Aucun fichier importé"
										}),
										slot.path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											className: "mt-1",
											onClick: () => setForm({
												...form,
												...slot.bucket === "covers" ? { cover_path: null } : slot.bucket === "previews" ? { preview_path: null } : { master_path: null }
											}),
											children: "Retirer"
										}) : null
									]
								}, slot.bucket))
							}),
							uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-primary",
								children: "Import du fichier en cours…"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap items-end gap-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Statut",
							htmlFor: "status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								id: "status",
								value: form.status,
								onChange: (e) => setForm({
									...form,
									status: e.target.value
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "draft",
									children: "Brouillon"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "published",
									children: "Publié"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 pb-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.featured,
								onChange: (e) => setForm({
									...form,
									featured: e.target.checked
								})
							}), "Mettre en avant sur la page d'accueil"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending || uploading,
							children: uploading ? "Import en cours…" : save.isPending ? "Enregistrement…" : "Enregistrer le beat"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => setForm(null),
							children: "Annuler"
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: search,
				onChange: (event) => setSearch(event.target.value),
				placeholder: "Rechercher un beat par titre, genre ou tag",
				"aria-label": "Rechercher dans les beats",
				className: "mb-4 max-w-xl"
			}), beats.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" })]
			}) : filteredBeats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: search ? "Aucun beat trouvé" : "Aucun beat pour le moment",
				description: search ? "Essayez un autre titre, genre ou tag." : "Importez votre première instrumentale pour ouvrir le catalogue."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: filteredBeats.map((beat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "admin-beat-row flex cursor-pointer items-center gap-4 rounded-2xl bg-surface p-3 ring-1 ring-border",
					onClick: () => setSelectedBeat(beat),
					onKeyDown: (event) => {
						if (event.key === "Enter" || event.key === " ") setSelectedBeat(beat);
					},
					role: "button",
					tabIndex: 0,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
							path: beat.cover_path,
							alt: "",
							className: "size-14 rounded-xl"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: beat.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									formatPrice(beat.price),
									" · ",
									beat.genre ?? "—",
									" · ",
									beat.bpm ?? "—",
									" BPM"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: beat.status === "published" ? "success" : "neutral",
							children: beat.status === "published" ? "publié" : "brouillon"
						}),
						beat.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "accent",
							children: "à la une"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "iconSm",
							"aria-label": `Modifier ${beat.title}`,
							onClick: (event) => {
								event.stopPropagation();
								setForm(toForm(beat));
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
							title: `Supprimer « ${beat.title} » ?`,
							description: "Le beat, ses favoris et ses commentaires seront supprimés. Cette action est irréversible.",
							confirmLabel: "Supprimer le beat",
							onConfirm: () => remove.mutate(beat.id),
							trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "iconSm",
								"aria-label": `Supprimer ${beat.title}`,
								onClick: (event) => event.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
							})
						})
					]
				}, beat.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedBeat,
				onOpenChange: (open) => !open && setSelectedBeat(null),
				children: selectedBeat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "admin-beat-dialog max-h-[90vh] max-w-3xl overflow-y-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "font-display text-3xl tracking-tight",
						children: selectedBeat.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Vue détaillée de cette instrumentale dans le catalogue." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-7 pt-3 md:grid-cols-[15rem_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
								path: selectedBeat.cover_path,
								alt: `Pochette de ${selectedBeat.title}`,
								className: "aspect-square w-full rounded-2xl"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								block: true,
								className: "mt-4",
								onClick: () => toggle({
									id: selectedBeat.id,
									title: selectedBeat.title,
									slug: selectedBeat.slug,
									bpm: selectedBeat.bpm,
									coverPath: selectedBeat.cover_path,
									previewPath: selectedBeat.preview_path
								}),
								disabled: !selectedBeat.preview_path,
								children: [current?.id === selectedBeat.id && playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), current?.id === selectedBeat.id && playing ? "Pause" : "Écouter / rejouer"]
							}),
							!selectedBeat.preview_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Aucun extrait audio importé."
							}) : null
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: selectedBeat.status === "published" ? "success" : "neutral",
									children: selectedBeat.status === "published" ? "Publié" : "Brouillon"
								}), selectedBeat.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "accent",
									children: "À la une"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 text-sm leading-relaxed text-muted-foreground",
								children: selectedBeat.description || "Aucune description pour ce beat."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border sm:grid-cols-4",
								children: [
									{
										label: "Genre",
										value: selectedBeat.genre || "—"
									},
									{
										label: "Ambiance",
										value: selectedBeat.mood || "—"
									},
									{
										label: "BPM",
										value: selectedBeat.bpm || "—"
									},
									{
										label: "Tonalité",
										value: selectedBeat.song_key || "—"
									}
								].map((fact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-background px-3 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-[10px] uppercase tracking-widest text-muted-foreground",
										children: fact.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 text-sm font-medium",
										children: fact.value
									})]
								}, fact.label))
							}),
							selectedBeat.tags.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 flex flex-wrap gap-2",
								children: selectedBeat.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-surface-2 px-3 py-1 text-xs text-muted-foreground",
									children: ["#", tag]
								}, tag))
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 border-t border-border pt-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Licences"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2",
									children: selectedBeat.licenses.map((license) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											license.name,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-muted-foreground",
												children: ["· ", license.files]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-primary",
											children: formatPrice(license.price)
										})]
									}, license.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-5 text-xs text-muted-foreground",
								children: [
									"Fichiers: ",
									selectedBeat.cover_path ? "pochette" : "sans pochette",
									" ·",
									" ",
									selectedBeat.preview_path ? "extrait audio" : "sans extrait",
									" ·",
									" ",
									selectedBeat.master_path ? "master privé" : "sans master"
								]
							})
						] })]
					})]
				}) : null
			})
		]
	});
}
//#endregion
export { AdminBeats as component };
