import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { r as useAuth } from "./auth-Cua3bUdT.mjs";
import { t as track } from "./analytics-CloptECG.mjs";
import { n as usePlayer } from "./player-DDaVawzJ.mjs";
import { B as ArrowLeft, C as MessageCircle, L as Ear, _ as Play, b as Pause, s as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Cover } from "./Cover-mk6eKWWi.mjs";
import { i as Skeleton, n as EmptyState, r as ErrorState } from "./states-BmQ6RF0h.mjs";
import { a as formatPrice, i as formatCount, r as beatStatsQuery, t as BEAT_COLUMNS } from "./beats-BosAjMsc.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as SiteLayout } from "./SiteLayout-DqeSBX0E.mjs";
import { t as ConfirmDialog } from "./confirm-DHdPtoX_.mjs";
import { i as Textarea } from "./field-C2NZwmZ2.mjs";
import { r as sanitizeCommentInput, t as COMMENT_MAX_LENGTH } from "./validation-C5rGgsFo.mjs";
import { n as LikeButton, t as CartButton } from "./LikeButton-DzAkqU1M.mjs";
import { t as Route } from "./beats_._slug-DaZobW2m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beats_._slug-_hpJ1Oeb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Comments({ beatId }) {
	const { user, isAdmin } = useAuth();
	const queryClient = useQueryClient();
	const [value, setValue] = (0, import_react.useState)("");
	const [replyValue, setReplyValue] = (0, import_react.useState)("");
	const [replyTo, setReplyTo] = (0, import_react.useState)(null);
	const comments = useQuery({
		queryKey: ["comments", beatId],
		queryFn: async () => {
			const { data, error } = await supabase.from("comments").select("id, content, created_at, user_id, parent_id").eq("beat_id", beatId).order("created_at", { ascending: false });
			if (error) throw error;
			const rows = data ?? [];
			const ids = Array.from(new Set(rows.map((r) => r.user_id)));
			let names = {};
			if (ids.length) {
				const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", ids);
				names = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name ?? "Auditeur"]));
			}
			return rows.map((r) => ({
				...r,
				author: names[r.user_id] ?? "Auditeur"
			}));
		}
	});
	const addComment = useMutation({
		mutationFn: async ({ content, parentId }) => {
			if (!user) throw new Error("auth");
			const { error } = await supabase.from("comments").insert({
				beat_id: beatId,
				user_id: user.id,
				content,
				parent_id: parentId
			});
			if (error) throw error;
			track("beat_comment", { beatId });
		},
		onSuccess: () => {
			setValue("");
			setReplyValue("");
			setReplyTo(null);
			queryClient.invalidateQueries({ queryKey: ["comments", beatId] });
			queryClient.invalidateQueries({ queryKey: ["beat-stats"] });
			queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
			queryClient.invalidateQueries({ queryKey: ["admin-beat-stats"] });
			toast.success("Commentaire publié");
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Votre commentaire n'a pas pu être publié.")
	});
	const removeComment = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("comments").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", beatId] });
			queryClient.invalidateQueries({ queryKey: ["beat-stats"] });
			queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
			queryClient.invalidateQueries({ queryKey: ["admin-beat-stats"] });
			toast.success("Commentaire supprimé");
		},
		onError: () => toast.error("Ce commentaire n'a pas pu être supprimé.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "comments-heading",
		className: "mt-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "comments-heading",
				className: "font-display text-2xl font-semibold tracking-tight",
				children: "Commentaires"
			}),
			user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6",
				onSubmit: (e) => {
					e.preventDefault();
					const sanitized = sanitizeCommentInput(value);
					if (!sanitized) {
						toast.error("Votre commentaire ne peut pas être vide.");
						return;
					}
					addComment.mutate({
						content: sanitized,
						parentId: null
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value,
					onChange: (e) => setValue(e.target.value),
					rows: 3,
					maxLength: COMMENT_MAX_LENGTH,
					"aria-label": "Écrire un commentaire",
					placeholder: "Partagez votre avis sur ce beat…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] text-muted-foreground",
						children: [
							value.length,
							"/",
							COMMENT_MAX_LENGTH
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "sm",
						disabled: !value.trim() || addComment.isPending,
						children: addComment.isPending ? "Publication…" : "Publier"
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 rounded-2xl bg-surface p-4 text-sm text-muted-foreground ring-1 ring-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						className: "text-primary underline underline-offset-4",
						children: "Connectez-vous"
					}),
					" ",
					"pour laisser un commentaire sur ce beat."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-5",
				children: comments.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" })] }) : (comments.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Aucun commentaire",
					description: "Soyez le premier à réagir à ce beat."
				}) : (comments.data ?? []).filter((c) => !c.parent_id).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl bg-surface p-4 ring-1 ring-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: c.author
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
									dateTime: c.created_at,
									className: "text-[11px] text-muted-foreground",
									children: new Date(c.created_at).toLocaleDateString()
								}), user && (user.id === c.user_id || isAdmin) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
									title: "Supprimer ce commentaire ?",
									description: "Cette action est irréversible.",
									confirmLabel: "Supprimer",
									onConfirm: () => removeComment.mutate(c.id),
									trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"aria-label": "Supprimer le commentaire",
										className: "text-muted-foreground hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})
								}) : null]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground",
							children: c.content
						}),
						user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-3 text-xs text-primary hover:underline",
							onClick: () => setReplyTo(replyTo === c.id ? null : c.id),
							children: replyTo === c.id ? "Annuler" : "Répondre"
						}) : null,
						(comments.data ?? []).filter((reply) => reply.parent_id === c.id).map((reply) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 border-l-2 border-border pl-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: reply.author
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-muted-foreground",
								children: reply.content
							})]
						}, reply.id)),
						replyTo === c.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 space-y-2",
							onSubmit: (e) => {
								e.preventDefault();
								const sanitized = sanitizeCommentInput(replyValue);
								if (sanitized) addComment.mutate({
									content: sanitized,
									parentId: c.id
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: replyValue,
								onChange: (e) => setReplyValue(e.target.value),
								rows: 2,
								maxLength: COMMENT_MAX_LENGTH,
								"aria-label": "Écrire une réponse",
								placeholder: "Répondre à ce commentaire…"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "sm",
								disabled: !replyValue.trim() || addComment.isPending,
								children: "Répondre"
							})]
						}) : null
					]
				}, c.id))
			})
		]
	});
}
function buildWhatsappMessage(intent) {
	return [
		`Bonjour ${intent.producerName}, je suis intéressé(e) par le beat "${intent.beatTitle}".`,
		intent.licenseName ? `Licence : ${intent.licenseName}` : null,
		typeof intent.price === "number" && intent.price > 0 ? `Prix affiché : ${intent.price} $` : null,
		intent.buyerName ? `Mon nom : ${intent.buyerName}` : null,
		`Référence du beat : ${intent.beatId}`,
		"Je l'ai trouvé sur votre site et j'aimerais connaître les licences disponibles et les tarifs."
	].filter(Boolean).join("\n");
}
var activeProvider = {
	id: "whatsapp",
	label: "Demander via WhatsApp",
	isConfigured: (intent) => !!intent.whatsappNumber?.replace(/\D/g, ""),
	start: async (intent) => {
		const url = `https://wa.me/${intent.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(buildWhatsappMessage(intent))}`;
		await track("whatsapp_click", { beatId: intent.beatId });
		window.open(url, "_blank", "noopener,noreferrer");
	}
};
function startPurchase(intent) {
	return activeProvider.start(intent);
}
function BeatDetailPage() {
	const { slug } = Route.useParams();
	const { profile } = useAuth();
	const { data: settings } = useSettings();
	const { current, playing, toggle } = usePlayer();
	const [licenseIndex, setLicenseIndex] = (0, import_react.useState)(0);
	const beatQuery = useQuery({
		queryKey: ["beat", slug],
		queryFn: async () => {
			const { data, error } = await supabase.from("beats").select(BEAT_COLUMNS).eq("slug", slug).eq("status", "published").maybeSingle();
			if (error) throw error;
			return data ?? null;
		}
	});
	const stats = useQuery(beatStatsQuery(beatQuery.data?.id ? [beatQuery.data.id] : []));
	const beat = beatQuery.data ?? null;
	(0, import_react.useEffect)(() => {
		if (beat) track("beat_view", {
			beatId: beat.id,
			once: true
		});
	}, [beat]);
	if (beatQuery.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,420px)_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-2/3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" })
			]
		})]
	}) });
	if (beatQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl px-5 py-24 sm:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			title: "Une erreur est survenue",
			description: "Ce beat n'a pas pu être chargé.",
			onRetry: () => void beatQuery.refetch()
		})
	}) });
	if (!beat) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl px-5 py-24 sm:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Beat introuvable",
			description: "Cette instrumentale n'est peut-être plus publiée.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/beats",
					children: "Retour au catalogue"
				})
			})
		})
	}) });
	const s = stats.data?.[beat.id];
	const licenses = Array.isArray(beat.licenses) ? beat.licenses : [];
	const selected = licenses[licenseIndex];
	const isPlaying = current?.id === beat.id && playing;
	const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");
	const facts = [
		{
			label: "BPM",
			value: beat.bpm ? String(beat.bpm) : "—"
		},
		{
			label: "Tonalité",
			value: beat.song_key ?? "—"
		},
		{
			label: "Genre",
			value: beat.genre ?? "—"
		},
		{
			label: "Ambiance",
			value: beat.mood ?? "—"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/beats",
				className: "inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
					className: "size-3.5",
					"aria-hidden": "true"
				}), "Catalogue"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
					path: beat.cover_path,
					alt: `Pochette de ${beat.title}`,
					className: "aspect-square w-full rounded-3xl ring-1 ring-border",
					sizes: "(min-width: 1024px) 420px, 100vw"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							onClick: () => toggle({
								id: beat.id,
								title: beat.title,
								slug: beat.slug,
								bpm: beat.bpm,
								coverPath: beat.cover_path,
								previewPath: beat.preview_path
							}),
							children: [isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), isPlaying ? "Mettre en pause" : "Écouter l'extrait"]
						}),
						s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LikeButton, {
							beatId: beat.id,
							count: s.likes
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LikeButton, { beatId: beat.id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartButton, { beatId: beat.id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 text-[10px] tracking-widest text-muted-foreground uppercase",
							title: `${formatCount(s?.plays)} écoutes`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ear, {
									className: "size-3.5",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "sr-only",
									children: [formatCount(s?.plays), " écoutes"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: formatCount(s?.plays)
								})
							]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl font-semibold tracking-tighter sm:text-5xl",
						children: beat.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-primary",
						children: formatPrice(beat.price)
					}),
					beat.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl leading-relaxed whitespace-pre-line text-muted-foreground",
						children: beat.description
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-4",
						children: facts.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-background px-4 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase",
								children: f.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1.5 text-sm font-medium",
								children: f.value
							})]
						}, f.label))
					}),
					beat.tags?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-6 flex flex-wrap gap-2",
						children: beat.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-full bg-surface px-3 py-1 text-[11px] text-muted-foreground ring-1 ring-border",
							children: ["#", tag]
						}, tag))
					}) : null,
					licenses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "mt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-[11px] tracking-[0.25em] text-muted-foreground uppercase",
							children: "Choisissez une licence"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: licenses.map((license, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: `cursor-pointer rounded-2xl p-4 ring-1 transition-colors ${licenseIndex === i ? "bg-surface ring-primary" : "bg-surface/50 ring-border hover:bg-surface"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: "license",
										className: "sr-only",
										checked: licenseIndex === i,
										onChange: () => setLicenseIndex(i)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium",
											children: license.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-primary",
											children: formatPrice(license.price)
										})]
									}),
									license.files ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-xs text-muted-foreground",
										children: license.files
									}) : null
								]
							}, license.id ?? license.name ?? i))
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 rounded-3xl bg-surface p-6 ring-1 ring-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "L'achat se fait directement avec le producteur. Envoyez votre demande et vous recevrez aussitôt les détails de la licence, les stems et les moyens de paiement."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "whatsapp",
							size: "lg",
							block: true,
							className: "mt-5",
							disabled: !whatsappReady,
							onClick: () => void startPurchase({
								beatId: beat.id,
								beatTitle: beat.title,
								licenseName: selected?.name ?? null,
								price: selected?.price ?? beat.price,
								producerName: settings?.producer_name ?? "Dany Beats",
								buyerName: profile?.display_name ?? null,
								whatsappNumber: settings?.whatsapp_number ?? ""
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {}), whatsappReady ? "Acheter via WhatsApp" : "WhatsApp non configuré"]
						})]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-3xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comments, { beatId: beat.id })
			})
		]
	}) });
}
//#endregion
export { BeatDetailPage as component };
