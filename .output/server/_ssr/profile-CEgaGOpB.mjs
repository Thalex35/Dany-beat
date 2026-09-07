import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { n as signOut, r as useAuth } from "./auth-Cua3bUdT.mjs";
import { T as LogOut } from "../_libs/lucide-react.mjs";
import { i as Skeleton, n as EmptyState } from "./states-BmQ6RF0h.mjs";
import { r as beatStatsQuery, t as BEAT_COLUMNS } from "./beats-BosAjMsc.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as SiteLayout } from "./SiteLayout-B4SGEV6l.mjs";
import { i as Textarea, n as Input, t as Field } from "./field-C2NZwmZ2.mjs";
import { t as BeatCard } from "./BeatCard-DuKorNwA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-CEgaGOpB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { user, profile } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	async function handleSignOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await signOut();
		navigate({
			to: "/",
			replace: true
		});
	}
	(0, import_react.useEffect)(() => {
		setDisplayName(profile?.display_name ?? "");
		setBio(profile?.bio ?? "");
	}, [profile?.display_name, profile?.bio]);
	const save = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("profiles").update({
				display_name: displayName.trim() || null,
				bio: bio.trim() || null
			}).eq("id", user.id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["me"] });
			toast.success("Profil mis à jour");
		},
		onError: () => toast.error("Votre profil n'a pas pu être enregistré.")
	});
	const liked = useQuery({
		queryKey: ["liked-beats", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data: likes, error } = await supabase.from("likes").select("beat_id").eq("user_id", user.id);
			if (error) throw error;
			const ids = (likes ?? []).map((l) => l.beat_id);
			if (!ids.length) return [];
			const { data, error: beatsError } = await supabase.from("beats").select(BEAT_COLUMNS).in("id", ids).eq("status", "published");
			if (beatsError) throw beatsError;
			return data ?? [];
		}
	});
	const stats = useQuery(beatStatsQuery(liked.data?.map((beat) => beat.id) ?? []));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "public-account-page mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "profile-hero flex flex-wrap items-start justify-between gap-4 rounded-3xl p-7 sm:p-9",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-semibold tracking-tighter",
					children: "Mon compte"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: user?.email
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => void handleSignOut(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {}), "Déconnexion"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "profile-form mt-8 max-w-2xl space-y-4 rounded-3xl p-6 sm:p-8",
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nom affiché",
						htmlFor: "displayName",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "displayName",
							value: displayName,
							onChange: (e) => setDisplayName(e.target.value),
							maxLength: 60
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Biographie",
						htmlFor: "bio",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "bio",
							rows: 3,
							value: bio,
							onChange: (e) => setBio(e.target.value),
							maxLength: 280
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: save.isPending ? "Enregistrement…" : "Enregistrer les modifications"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "profile-favorites mt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-semibold tracking-tight",
					children: "Beats favoris"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: liked.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-8 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square w-full" })]
					}) : (liked.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "Aucun beat en favori",
						description: "Touchez le cœur sur un beat pour le retrouver ici."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-8 sm:grid-cols-2",
						children: (liked.data ?? []).map((beat) => {
							const s = stats.data?.[beat.id];
							return s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, {
								beat,
								stats: s
							}, beat.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeatCard, { beat }, beat.id);
						})
					})
				})]
			})
		]
	}) });
}
//#endregion
export { ProfilePage as component };
