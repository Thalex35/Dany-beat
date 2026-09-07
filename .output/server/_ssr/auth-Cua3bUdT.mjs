import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Cua3bUdT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)({
	session: null,
	user: null,
	loading: true,
	roleLoading: true,
	profile: null,
	isAdmin: false
});
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
			setSession(nextSession);
			setLoading(false);
			if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") queryClient.invalidateQueries({ queryKey: ["me"] });
		});
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		return () => sub.subscription.unsubscribe();
	}, [queryClient]);
	const userId = session?.user.id ?? null;
	const { data, isPending } = useQuery({
		queryKey: ["me", userId],
		enabled: !!userId,
		queryFn: async () => {
			const [profileRes, roleRes] = await Promise.all([supabase.from("profiles").select("id, display_name, avatar_url, bio").eq("id", userId).maybeSingle(), supabase.rpc("has_role", {
				_user_id: userId,
				_role: "admin"
			})]);
			if (profileRes.error) throw profileRes.error;
			if (roleRes.error) throw roleRes.error;
			let profile = profileRes.data ?? null;
			if (!profile) {
				const displayName = session?.user.user_metadata?.display_name ?? session?.user.email?.split("@")[0] ?? "Auditeur";
				const { data: createdProfile, error: createProfileError } = await supabase.from("profiles").upsert({
					id: userId,
					display_name: displayName
				}, { onConflict: "id" }).select("id, display_name, avatar_url, bio").single();
				if (createProfileError) throw createProfileError;
				profile = createdProfile;
			}
			return {
				profile,
				isAdmin: Boolean(roleRes.data)
			};
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			session,
			user: session?.user ?? null,
			loading,
			roleLoading: !!userId && isPending,
			profile: data?.profile ?? null,
			isAdmin: data?.isAdmin ?? false
		},
		children
	});
}
function useAuth() {
	return (0, import_react.useContext)(AuthContext);
}
async function signOut() {
	await supabase.auth.signOut();
}
//#endregion
export { signOut as n, useAuth as r, AuthProvider as t };
