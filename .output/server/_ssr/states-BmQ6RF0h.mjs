import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { E as LoaderCircle, o as TriangleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/states-BmQ6RF0h.js
var import_jsx_runtime = require_jsx_runtime();
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("animate-pulse rounded-xl bg-surface-2", className) });
}
function Spinner({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		className: cn("size-4 animate-spin", className),
		"aria-hidden": "true"
	});
}
function EmptyState({ title, description, action, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel flex flex-col items-center gap-3 px-6 py-14 text-center",
		children: [
			icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-muted-foreground",
				children: icon
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: description
			}) : null,
			action
		]
	});
}
function ErrorState({ title = "Une erreur est survenue", description, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "panel flex flex-col items-center gap-3 px-6 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
				className: "size-5 text-destructive",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-base",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: description
			}) : null,
			onRetry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onRetry,
				className: "text-xs font-medium text-primary underline underline-offset-4",
				children: "Réessayer"
			}) : null
		]
	});
}
function Badge({ children, tone = "neutral", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase", {
			neutral: "bg-surface-2 text-foreground",
			accent: "bg-primary/15 text-primary",
			success: "bg-success/15 text-success",
			muted: "bg-surface text-muted-foreground"
		}[tone], className),
		children
	});
}
//#endregion
export { Spinner as a, Skeleton as i, EmptyState as n, ErrorState as r, Badge as t };
