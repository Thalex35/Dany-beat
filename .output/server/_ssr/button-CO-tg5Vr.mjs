import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, v as Slot, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-CO-tg5Vr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,background-color,color,box-shadow] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-foreground ring-2 ring-primary/20 hover:bg-primary/90",
			default: "bg-primary text-primary-foreground ring-2 ring-primary/20 hover:bg-primary/90",
			solid: "bg-foreground text-background hover:bg-foreground/90",
			outline: "border border-border text-foreground hover:bg-surface",
			ghost: "text-muted-foreground hover:bg-surface hover:text-foreground",
			link: "text-primary underline-offset-4 hover:underline",
			secondary: "bg-surface-2 text-foreground hover:bg-surface-2/80",
			surface: "bg-surface text-foreground ring-1 ring-border hover:bg-surface-2",
			whatsapp: "bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
		},
		size: {
			sm: "h-9 px-4 text-xs [&_svg]:size-4",
			md: "h-11 px-5 text-sm [&_svg]:size-4",
			default: "h-11 px-5 text-sm [&_svg]:size-4",
			lg: "h-12 px-7 text-sm [&_svg]:size-5",
			icon: "size-10 [&_svg]:size-4",
			iconSm: "size-9 [&_svg]:size-4"
		},
		block: {
			true: "w-full",
			false: ""
		},
		shape: {
			pill: "",
			square: "rounded-xl"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
		block: false,
		shape: "pill"
	}
});
var Button = import_react.forwardRef(function Button({ className, variant, size, block, shape, asChild = false, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		className: cn(buttonVariants({
			variant,
			size,
			block,
			shape
		}), className),
		...props
	});
});
//#endregion
export { Button as t };
