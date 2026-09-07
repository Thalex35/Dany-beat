import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as usePlayer } from "./player-tx6FKj0w.mjs";
import { g as Play, m as RotateCcw, y as Pause } from "../_libs/lucide-react.mjs";
import { t as Cover } from "./Cover-mk6eKWWi.mjs";
import { i as formatPrice, r as formatCount } from "./beats-B5LKfYIS.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as LikeButton, t as CartButton } from "./LikeButton-CZibv4An.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BeatCard-BCiFNL74.js
var import_jsx_runtime = require_jsx_runtime();
function BeatCard({ beat, stats }) {
	const { current, playing, finished, toggle } = usePlayer();
	const isCurrent = current?.id === beat.id;
	const isPlaying = isCurrent && playing;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "public-beat-art relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-border",
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
				className: "flex items-start justify-between gap-3",
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
					className: "font-display font-medium text-primary",
					children: formatPrice(beat.price)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "public-beat-actions flex items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => toggle({
							id: beat.id,
							title: beat.title,
							slug: beat.slug,
							bpm: beat.bpm,
							coverPath: beat.cover_path,
							previewPath: beat.preview_path
						}),
						"aria-label": finished && isCurrent ? `Rejouer ${beat.title}` : isPlaying ? `Mettre ${beat.title} en pause` : `Écouter ${beat.title}`,
						className: "grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105",
						children: finished && isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }) : isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-5 text-[10px] tracking-widest text-muted-foreground uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [formatCount(stats?.plays), " écoutes"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LikeButton, {
							beatId: beat.id,
							count: stats?.likes
						})]
					}),
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
