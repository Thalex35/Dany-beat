import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as useSignedUrl } from "./media-C1QoYJjN.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { I as Disc3 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Cover-mk6eKWWi.js
var import_jsx_runtime = require_jsx_runtime();
function Cover({ path, alt, className, sizes }) {
	const { data: url, isPending } = useSignedUrl("covers", path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative overflow-hidden bg-surface", className),
		children: url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt,
			loading: "lazy",
			decoding: "async",
			sizes,
			className: "h-full w-full object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid h-full w-full place-items-center text-muted-foreground/40",
			children: path && isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full animate-pulse bg-surface-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc3, {
				className: "size-10",
				"aria-hidden": "true"
			})
		})
	});
}
//#endregion
export { Cover as t };
