import { a as Overlay2, c as Title2, i as Description2, l as Trigger2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/confirm-DHdPtoX_.js
var import_jsx_runtime = require_jsx_runtime();
function ConfirmDialog({ trigger, title, description, confirmLabel = "Confirmer", onConfirm, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root2, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger2, {
		asChild: true,
		children: trigger
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Portal2, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content2, {
		className: "panel fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
				className: "font-display text-lg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
				className: "mt-2 text-sm text-muted-foreground",
				children: description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						children: "Annuler"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						size: "sm",
						disabled: loading,
						onClick: onConfirm,
						children: confirmLabel
					})
				})]
			})
		]
	})] })] });
}
//#endregion
export { ConfirmDialog as t };
