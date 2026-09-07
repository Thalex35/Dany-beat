import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** True while the profile/role lookup for a signed-in user is still running. */
  roleLoading: boolean;
  profile: Profile | null;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  loading: true,
  roleLoading: true,
  profile: null,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries({ queryKey: ["me"] });
      }
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
      const [profileRes, roleRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, bio")
          .eq("id", userId!)
          .maybeSingle(),
        supabase.rpc("has_role", { _user_id: userId!, _role: "admin" }),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (roleRes.error) throw roleRes.error;

      let profile = (profileRes.data as Profile | null) ?? null;
      if (!profile) {
        const displayName =
          (session?.user.user_metadata?.display_name as string | undefined) ??
          session?.user.email?.split("@")[0] ??
          "Auditeur";
        const { data: createdProfile, error: createProfileError } = await supabase
          .from("profiles")
          .upsert({ id: userId!, display_name: displayName }, { onConflict: "id" })
          .select("id, display_name, avatar_url, bio")
          .single();
        if (createProfileError) throw createProfileError;
        profile = createdProfile as Profile;
      }

      return {
        profile,
        isAdmin: Boolean(roleRes.data),
      };
    },
  });

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        roleLoading: !!userId && isPending,
        profile: data?.profile ?? null,
        isAdmin: data?.isAdmin ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function signOut() {
  await supabase.auth.signOut();
}
