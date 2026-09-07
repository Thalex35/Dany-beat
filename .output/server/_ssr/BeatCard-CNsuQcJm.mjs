import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useSettings } from "./settings-DfgoQbFU.mjs";
import { n as usePlayer } from "./player-DDaVawzJ.mjs";
import { L as Ear, T as Mail, _ as Play, b as Pause, m as RotateCcw } from "../_libs/lucide-react.mjs";
import { t as Cover } from "./Cover-mk6eKWWi.mjs";
import { a as formatPrice, i as formatCount } from "./beats-BosAjMsc.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as openEmail } from "./contact-DLBfuZs_.mjs";
import { n as LikeButton, t as CartButton } from "./LikeButton-DzAkqU1M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BeatCard-CNsuQcJm.js
var import_jsx_runtime = require_jsx_runtime();
function BeatCard({ beat, stats, queue }) {
	const { current, playing, finished, toggle, play } = usePlayer();
	const { data: settings } = useSettings();
	const isCurrent = current?.id === beat.id;
	const isPlaying = isCurrent && playing;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group flex min-w-0 flex-col gap-4 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "public-beat-art relative aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/beats/$slug",
						params: { slug: beat.slug },
						"aria-label": `Ouvrir ${beat.title}`,
						className: "block h-full w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
							path: beat.cover_path,
							alt: `Pochette de ${beat.title}`,
							className: "h-full w-full"
						})
					}),
					beat.bpm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute bottom-3 left-3 rounded bg-background/90 px-2 py-1 text-[10px] font-medium tracking-wide uppercase backdrop-blur-sm",
						children: [beat.bpm, " BPM"]
					}) : null,
					beat.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute top-3 left-3 rounded bg-primary px-2 py-1 text-[10px] font-medium tracking-wide text-primary-foreground uppercase",
						children: "À la une"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "truncate text-base font-medium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/beats/$slug",
							params: { slug: beat.slug },
							className: "hover:text-primary",
							children: beat.title
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: [beat.genre, beat.mood].filter(Boolean).join(" • ") || "Instrumentale"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 font-display text-sm font-medium text-primary",
					children: formatPrice(beat.price)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "public-beat-actions flex items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const track = {
								id: beat.id,
								title: beat.title,
								slug: beat.slug,
								bpm: beat.bpm,
								coverPath: beat.cover_path,
								previewPath: beat.preview_path
							};
							if (queue) play(track, queue.map((item) => ({
								id: item.id,
								title: item.title,
								slug: item.slug,
								bpm: item.bpm,
								coverPath: item.cover_path,
								previewPath: item.preview_path
							})));
							else toggle(track);
						},
						"aria-label": finished && isCurrent ? `Rejouer ${beat.title}` : isPlaying ? `Mettre ${beat.title} en pause` : `Écouter ${beat.title}`,
						className: "grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105",
						children: finished && isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }) : isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-5 text-[10px] tracking-widest text-muted-foreground uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							title: `${formatCount(stats?.plays)} écoutes`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ear, {
									className: "size-3.5",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "sr-only",
									children: [formatCount(stats?.plays), " écoutes"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: formatCount(stats?.plays)
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LikeButton, {
							beatId: beat.id,
							count: stats?.likes
						})]
					}),
					settings?.contact_email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-muted-foreground transition-colors hover:text-foreground",
						"aria-label": `Envoyer un e-mail à propos de ${beat.title}`,
						title: "Envoyer par e-mail",
						onClick: () => openEmail({
							to: settings.contact_email,
							subject: `Demande de licence : ${beat.title}`,
							body: `Bonjour,\n\nJe suis intéressé par le beat « ${beat.title} ».\n\nPouvez-vous me renseigner sur les licences disponibles ?\n\nMerci.`
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
							className: "size-4",
							"aria-hidden": "true"
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartButton, {
						beatId: beat.id,
						className: "ml-auto"
					})
				]
			})
		]
	});
}
//#endregion
export { BeatCard as t };
