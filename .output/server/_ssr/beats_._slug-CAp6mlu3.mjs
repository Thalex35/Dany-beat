import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beats_._slug-CAp6mlu3.js
var $$splitComponentImporter = () => import("./beats_._slug-CQY-IAKm.mjs");
var Route = createFileRoute("/beats_/$slug")({
	head: ({ params }) => {
		const name = params.slug.replace(/-/g, " ");
		const title = `${name} — instrumentale | Dany Beats`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: `Écoutez l'instrumentale « ${name} » : BPM, tonalité et licences disponibles, puis contactez le producteur sur WhatsApp pour l'acquérir.`
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: `Écoutez l'instrumentale « ${name} » et obtenez votre licence directement auprès du producteur.`
			},
			{
				property: "og:type",
				content: "music.song"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
