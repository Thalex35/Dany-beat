import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { safeAuthRedirect } from "@/lib/validation";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "Connexion ou création de compte | Dany Beats" },
      {
        name: "description",
        content:
          "Connectez-vous pour aimer des beats, commenter les instrumentales et retrouver vos productions favorites.",
      },
      { property: "og:title", content: "Connexion | Dany Beats" },
      {
        property: "og:description",
        content: "Accédez à votre compte Dany Beats pour aimer et commenter les instrumentales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading, isAdmin, roleLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const destination = safeAuthRedirect(redirect);

  useEffect(() => {
    if (loading || !user || roleLoading) return;
    // Admins go straight to the dashboard; regular users stay on the public site.
    navigate({ to: isAdmin ? "/admin" : destination, replace: true });
  }, [loading, user, roleLoading, isAdmin, destination, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        void track("user_signup");
        if (!data.session) {
          setEmailSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void track("user_login");
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(destination)}`,
        },
      });
      if (error) {
        toast.error("La connexion Google a échoué. Réessayez.");
        return;
      }
      void track("user_login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La connexion Google a échoué.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="font-display block text-center text-xl font-semibold tracking-tighter uppercase"
        >
          Dany Beats
        </Link>

        {emailSent ? (
          <div className="mt-10 rounded-3xl bg-surface p-6 text-center ring-1 ring-border">
            <h1 className="font-display text-xl">Vérifiez votre boîte mail</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Nous avons envoyé un lien de confirmation à {email}. Confirmez-le pour finaliser la
              création de votre compte.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display mt-10 text-center text-3xl font-semibold tracking-tight">
              {mode === "signin" ? "Content de vous revoir" : "Créer votre compte"}
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Aimez des beats, commentez et retrouvez vos favoris au même endroit.
            </p>

            <Button
              variant="surface"
              size="lg"
              block
              className="mt-8"
              disabled={busy}
              onClick={() => void handleGoogle()}
            >
              Continuer avec Google
            </Button>

            <div className="my-6 flex items-center gap-3 text-[10px] tracking-widest text-muted-foreground uppercase">
              <span className="h-px flex-1 bg-border" />
              ou
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" ? (
                <Field label="Nom affiché" htmlFor="displayName">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="nickname"
                    placeholder="Comment devons-nous vous appeler ?"
                  />
                </Field>
              ) : null}
              <Field label="E-mail" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                />
              </Field>
              <Field label="Mot de passe" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                />
              </Field>
              <Button type="submit" size="lg" block disabled={busy}>
                {busy
                  ? "Veuillez patienter…"
                  : mode === "signin"
                    ? "Se connecter"
                    : "Créer mon compte"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Première visite ?" : "Vous avez déjà un compte ?"}{" "}
              <button
                className="text-primary underline underline-offset-4"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "Créer un compte" : "Se connecter"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
