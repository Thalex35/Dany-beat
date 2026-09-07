import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as useAuth } from "./auth-Cua3bUdT.mjs";
import { t as track } from "./analytics-CloptECG.mjs";
import { j as Heart, l as ShoppingCart } from "../_libs/lucide-react.mjs";
import { i as formatCount } from "./beats-BosAjMsc.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useToggleCart, r as useCartIds } from "./SiteLayout-B4SGEV6l.mjs";
import { n as safeAuthRedirect } from "./validation-C5rGgsFo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LikeButton-Cg-hsHCP.js
var import_jsx_runtime = require_jsx_runtime();
function CartButton({ beatId, className, size = "md" }) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { data: ids } = useCartIds();
	const toggle = useToggleCart();
	const inCart = !!ids?.includes(beatId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": inCart,
		"aria-label": inCart ? "Retirer ce beat du panier" : "Ajouter ce beat au panier",
		disabled: toggle.isPending,
		onClick: () => {
			if (!user) {
				toast("Connectez-vous pour ajouter des beats au panier");
				navigate({
					to: "/auth",
					search: { redirect: safeAuthRedirect(window.location.pathname) }
				});
				return;
			}
			toggle.mutate({
				beatId,
				inCart
			});
		},
		className: cn("grid shrink-0 place-items-center rounded-full ring-1 transition-colors disabled:opacity-50", size === "sm" ? "size-9" : "size-9", inCart ? "bg-primary text-primary-foreground ring-primary" : "bg-background/90 text-foreground ring-border hover:bg-surface", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {
			className: "size-4",
			"aria-hidden": "true"
		})
	});
}
function LikeButton({ beatId, count, className }) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: liked } = useQuery({
		queryKey: [
			"like",
			beatId,
			user?.id
		],
		enabled: !!user,
		queryFn: async () => {
			const { data } = await supabase.from("likes").select("id").eq("beat_id", beatId).eq("user_id", user.id).maybeSingle();
			return !!data;
		}
	});
	const mutation = useMutation({
		mutationFn: async (nextLiked) => {
			if (!user) throw new Error("auth");
			if (nextLiked) {
				const { error } = await supabase.from("likes").insert({
					beat_id: beatId,
					user_id: user.id
				});
				if (error && error.code !== "23505") throw error;
				track("beat_like", { beatId });
			} else {
				const { error } = await supabase.from("likes").delete().eq("beat_id", beatId).eq("user_id", user.id);
				if (error) throw error;
				track("beat_unlike", { beatId });
			}
			return nextLiked;
		},
		onMutate: async (nextLiked) => {
			await queryClient.cancelQueries({ queryKey: [
				"like",
				beatId,
				user?.id
			] });
			const previous = queryClient.getQueryData([
				"like",
				beatId,
				user?.id
			]);
			const previousStats = queryClient.getQueryData(["beat-stats"]);
			queryClient.setQueryData([
				"like",
				beatId,
				user?.id
			], nextLiked);
			if (previousStats?.[beatId]) queryClient.setQueryData(["beat-stats"], {
				...previousStats,
				[beatId]: {
					...previousStats[beatId],
					likes: Math.max(0, previousStats[beatId].likes + (nextLiked ? 1 : -1))
				}
			});
			return {
				previous,
				previousStats
			};
		},
		onError: (_error, _vars, context) => {
			queryClient.setQueryData([
				"like",
				beatId,
				user?.id
			], context?.previous);
			if (context?.previousStats) queryClient.setQueryData(["beat-stats"], context.previousStats);
			toast.error("Votre favori n'a pas pu être enregistré. Réessayez.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["beat-stats"] });
			queryClient.invalidateQueries({ queryKey: ["liked-beats"] });
		}
	});
	const optimisticCount = (count ?? 0) + (liked === true ? 0 : mutation.isPending && !liked ? 0 : 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": !!liked,
		"aria-label": liked ? "Retirer ce beat des favoris" : "Ajouter ce beat aux favoris",
		onClick: () => {
			if (!user) {
				toast("Connectez-vous pour ajouter des beats en favoris");
				navigate({
					to: "/auth",
					search: { redirect: safeAuthRedirect(window.location.pathname) }
				});
				return;
			}
			mutation.mutate(!liked);
		},
		className: cn("inline-flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground transition-colors hover:text-foreground", liked && "text-primary hover:text-primary", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
			className: cn("size-4", liked && "fill-current"),
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "tabular-nums",
			children: formatCount(optimisticCount)
		})]
	});
}
//#endregion
export { LikeButton as n, CartButton as t };
