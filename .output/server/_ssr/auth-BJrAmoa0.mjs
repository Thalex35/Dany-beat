import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { t as Button } from "./button-CO-tg5Vr.mjs";
import { r as useAuth } from "./auth-Cua3bUdT.mjs";
import { t as track } from "./analytics-CloptECG.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Input, t as Field } from "./field-C2NZwmZ2.mjs";
import { t as Route } from "./auth-C5k7SSva.mjs";
import { n as safeAuthRedirect } from "./validation-C5rGgsFo.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BJrAmoa0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		...opts,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
function AuthPage() {
	const { redirect } = Route.useSearch();
	const navigate = useNavigate();
	const { user, loading, isAdmin, roleLoading } = useAuth();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [emailSent, setEmailSent] = (0, import_react.useState)(false);
	const destination = safeAuthRedirect(redirect);
	(0, import_react.useEffect)(() => {
		if (loading || !user || roleLoading) return;
		navigate({
			to: isAdmin ? "/admin" : destination,
			replace: true
		});
	}, [
		loading,
		user,
		roleLoading,
		isAdmin,
		destination,
		navigate
	]);
	async function handleSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			if (mode === "signup") {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: window.location.origin,
						data: { display_name: displayName || email.split("@")[0] }
					}
				});
				if (error) throw error;
				track("user_signup");
				if (!data.session) {
					setEmailSent(true);
					return;
				}
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				track("user_login");
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Échec de l'authentification");
		} finally {
			setBusy(false);
		}
	}
	async function handleGoogle() {
		setBusy(true);
		try {
			const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
			if (result.error) {
				toast.error("La connexion Google a échoué. Réessayez.");
				return;
			}
			if (result.redirected) return;
			track("user_login");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center px-5 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "font-display block text-center text-xl font-semibold tracking-tighter uppercase",
				children: "Dany Beats"
			}), emailSent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 rounded-3xl bg-surface p-6 text-center ring-1 ring-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl",
					children: "Vérifiez votre boîte mail"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [
						"Nous avons envoyé un lien de confirmation à ",
						email,
						". Confirmez-le pour finaliser la création de votre compte."
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-10 text-center text-3xl font-semibold tracking-tight",
					children: mode === "signin" ? "Content de vous revoir" : "Créer votre compte"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-sm text-muted-foreground",
					children: "Aimez des beats, commentez et retrouvez vos favoris au même endroit."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "surface",
					size: "lg",
					block: true,
					className: "mt-8",
					disabled: busy,
					onClick: () => void handleGoogle(),
					children: "Continuer avec Google"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-6 flex items-center gap-3 text-[10px] tracking-widest text-muted-foreground uppercase",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
						"ou",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					children: [
						mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom affiché",
							htmlFor: "displayName",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "displayName",
								value: displayName,
								onChange: (e) => setDisplayName(e.target.value),
								autoComplete: "nickname",
								placeholder: "Comment devons-nous vous appeler ?"
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "E-mail",
							htmlFor: "email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								type: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								autoComplete: "email",
								placeholder: "vous@exemple.com"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Mot de passe",
							htmlFor: "password",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								type: "password",
								required: true,
								minLength: 8,
								value: password,
								onChange: (e) => setPassword(e.target.value),
								autoComplete: mode === "signin" ? "current-password" : "new-password",
								placeholder: "••••••••"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "lg",
							block: true,
							disabled: busy,
							children: busy ? "Veuillez patienter…" : mode === "signin" ? "Se connecter" : "Créer mon compte"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-center text-sm text-muted-foreground",
					children: [
						mode === "signin" ? "Première visite ?" : "Vous avez déjà un compte ?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-primary underline underline-offset-4",
							onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
							children: mode === "signin" ? "Créer un compte" : "Se connecter"
						})
					]
				})
			] })]
		})
	});
}
//#endregion
export { AuthPage as component };
