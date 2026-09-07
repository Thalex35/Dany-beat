import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/field-C2NZwmZ2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var base = "w-full rounded-xl bg-surface px-4 text-sm text-foreground ring-1 ring-border placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50";
var Input = import_react.forwardRef(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		className: cn(base, "h-11", className),
		...props
	});
});
var Textarea = import_react.forwardRef(function Textarea({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref,
		className: cn(base, "min-h-24 py-3", className),
		...props
	});
});
var Select = import_react.forwardRef(function Select({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		ref,
		className: cn(base, "h-11 pr-8", className),
		...props
	});
});
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("mb-1.5 block text-xs font-medium text-muted-foreground", className),
		...props
	});
}
function Field({ label, hint, error, htmlFor, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor,
			children: label
		}),
		children,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-destructive",
			children: error
		}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted-foreground/80",
			children: hint
		}) : null
	] });
}
//#endregion
export { Textarea as i, Input as n, Select as r, Field as t };
