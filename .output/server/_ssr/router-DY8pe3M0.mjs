import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as AuthProvider } from "./auth-Cua3bUdT.mjs";
import { t as PlayerProvider } from "./player-tx6FKj0w.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, k as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$14 } from "./auth-C5k7SSva.mjs";
import { t as Route$15 } from "./beats_._slug-otL5CXKz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DY8pe3M0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CvSmyuGX.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page introuvable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "La page que vous cherchez n'existe pas ou a été déplacée."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Retour à l'accueil"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Cette page n'a pas pu se charger"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Une erreur est survenue de notre côté. Réessayez ou revenez à l'accueil."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Réessayer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Retour à l'accueil"
					})]
				})
			]
		})
	});
}
var Route$13 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Dany Beats — Instrumentales rap & trap premium" },
			{
				name: "description",
				content: "Écoutez et licenciez les instrumentales rap, trap et afro originales du producteur Dany Beats."
			},
			{
				name: "author",
				content: "Dany Beats"
			},
			{
				property: "og:title",
				content: "Dany Beats — Instrumentales rap & trap premium"
			},
			{
				property: "og:description",
				content: "Écoutez et licenciez les instrumentales originales du producteur Dany Beats."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "fr",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$13.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PlayerProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })] }) })
	});
}
var $$splitComponentImporter$12 = () => import("./routes-CnjkjCmT.mjs");
var Route$12 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Dany Beats — Instrumentales rap, trap & afro" },
		{
			name: "description",
			content: "Écoutez des instrumentales rap, trap, drill et afro originales. Prévisualisez chaque beat puis contactez directement le producteur sur WhatsApp pour l'acquérir."
		},
		{
			property: "og:title",
			content: "Dany Beats — Instrumentales rap, trap & afro"
		},
		{
			property: "og:description",
			content: "Écoutez le catalogue d'instrumentales originales de Dany et obtenez votre licence directement."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./route-Di7iQBCH.mjs");
var Route$11 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./about-DKTfwH41.mjs");
var Route$10 = createFileRoute("/about")({
	head: () => ({ meta: [
		{ title: "À propos du producteur | Dany Beats" },
		{
			name: "description",
			content: "Découvrez Dany, producteur et beatmaker : son parcours, son style de production et comment le contacter pour obtenir la licence d'une instrumentale."
		},
		{
			property: "og:title",
			content: "À propos du producteur | Dany Beats"
		},
		{
			property: "og:description",
			content: "Parcours, style de production et contact direct pour vos licences de beats."
		},
		{
			property: "og:type",
			content: "profile"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./beats-DZzCYGH7.mjs");
var Route$9 = createFileRoute("/beats")({
	head: () => ({ meta: [
		{ title: "Catalogue de beats — rap, trap & afro | Dany Beats" },
		{
			name: "description",
			content: "Parcourez toutes les instrumentales publiées : filtrez par genre, ambiance et BPM, écoutez-les dans le player et obtenez votre licence via WhatsApp."
		},
		{
			property: "og:title",
			content: "Catalogue de beats | Dany Beats"
		},
		{
			property: "og:description",
			content: "Filtrez, écoutez et licenciez les instrumentales originales de Dany Beats."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./contact-Bn8sRVG9.mjs");
var Route$8 = createFileRoute("/contact")({
	head: () => ({ meta: [
		{ title: "Contact | Dany Beats" },
		{
			name: "description",
			content: "Contactez le producteur par e-mail ou WhatsApp pour toute question."
		},
		{
			property: "og:title",
			content: "Contact | Dany Beats"
		},
		{
			property: "og:description",
			content: "Écrivez-nous par e-mail ou WhatsApp."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./admin-OE5Mha32.mjs");
var Route$7 = createFileRoute("/_authenticated/admin")({
	head: () => ({ meta: [
		{ title: "Tableau de bord | Dany Beats" },
		{
			name: "description",
			content: "Espace privé du producteur pour gérer le catalogue de beats."
		},
		{
			name: "robots",
			content: "noindex, nofollow"
		},
		{
			property: "og:title",
			content: "Tableau de bord | Dany Beats"
		},
		{
			property: "og:description",
			content: "Espace privé du producteur."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./cart-Bbaumobu.mjs");
var Route$6 = createFileRoute("/_authenticated/cart")({
	head: () => ({ meta: [{ title: "Mon panier | Dany Beats" }, {
		name: "robots",
		content: "noindex, nofollow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./profile-D_8WMqTu.mjs");
var Route$5 = createFileRoute("/_authenticated/profile")({
	head: () => ({ meta: [
		{ title: "Mon compte | Dany Beats" },
		{
			name: "description",
			content: "Gérez votre profil Dany Beats et retrouvez les instrumentales que vous avez aimées."
		},
		{
			property: "og:title",
			content: "Mon compte | Dany Beats"
		},
		{
			property: "og:description",
			content: "Votre profil et vos beats favoris."
		},
		{
			property: "og:type",
			content: "profile"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.index-CcReDVgX.mjs");
var Route$4 = createFileRoute("/_authenticated/admin/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin.beats-tLQi466z.mjs");
var Route$3 = createFileRoute("/_authenticated/admin/beats")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./admin.cart-o47T0YFm.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/cart")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./admin.settings-CnVoeLbB.mjs");
var Route$1 = createFileRoute("/_authenticated/admin/settings")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./admin.users-Cyvv4swu.mjs");
var Route = createFileRoute("/_authenticated/admin/users")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$13
});
var AuthenticatedRouteRoute = Route$11.update({
	id: "/_authenticated",
	getParentRoute: () => Route$13
});
var AboutRoute = Route$10.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$13
});
var AuthRoute = Route$14.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$13
});
var BeatsRoute = Route$9.update({
	id: "/beats",
	path: "/beats",
	getParentRoute: () => Route$13
});
var ContactRoute = Route$8.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$13
});
var AuthenticatedAdminRoute = Route$7.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCartRoute = Route$6.update({
	id: "/cart",
	path: "/cart",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$5.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var BeatsSlugRoute = Route$15.update({
	id: "/beats_/$slug",
	path: "/beats/$slug",
	getParentRoute: () => Route$13
});
var AuthenticatedAdminIndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminRouteChildren = {
	AuthenticatedAdminBeatsRoute: Route$3.update({
		id: "/beats",
		path: "/beats",
		getParentRoute: () => AuthenticatedAdminRoute
	}),
	AuthenticatedAdminCartRoute: Route$2.update({
		id: "/cart",
		path: "/cart",
		getParentRoute: () => AuthenticatedAdminRoute
	}),
	AuthenticatedAdminSettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => AuthenticatedAdminRoute
	}),
	AuthenticatedAdminUsersRoute: Route.update({
		id: "/users",
		path: "/users",
		getParentRoute: () => AuthenticatedAdminRoute
	}),
	AuthenticatedAdminIndexRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRoute: AuthenticatedAdminRoute._addFileChildren(AuthenticatedAdminRouteChildren),
	AuthenticatedCartRoute,
	AuthenticatedProfileRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AboutRoute,
	AuthRoute,
	BeatsRoute,
	ContactRoute,
	BeatsSlugRoute
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
