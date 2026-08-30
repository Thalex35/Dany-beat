import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

/**
 * Pathless layout route: gates every route nested under `_authenticated/`
 * behind a valid Supabase session. Runs in `beforeLoad`, so it executes on
 * the router itself (not React), before any child route's loader/component.
 */
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
    return { userId: data.session.user.id };
  },
  component: () => <Outlet />,
});
