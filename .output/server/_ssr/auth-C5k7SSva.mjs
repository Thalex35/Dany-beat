import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-C5k7SSva.js
var $$splitComponentImporter = () => import("./auth-BJrAmoa0.mjs");
var Route = createFileRoute("/auth")({
	validateSearch: (search) => typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
	head: () => ({ meta: [
		{ title: "Connexion ou création de compte | Dany Beats" },
		{
			name: "description",
			content: "Connectez-vous pour aimer des beats, commenter les instrumentales et retrouver vos productions favorites."
		},
		{
			property: "og:title",
			content: "Connexion | Dany Beats"
		},
		{
			property: "og:description",
			content: "Accédez à votre compte Dany Beats pour aimer et commenter les instrumentales."
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
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
