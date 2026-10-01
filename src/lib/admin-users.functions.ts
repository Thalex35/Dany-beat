import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteRegularUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: callerRoleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (callerRoleError || !isAdmin) {
      throw new Error("Administrator access is required.");
    }

    const { data: targetRole, error: targetRoleError } = await context.supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", data.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (targetRoleError) {
      throw new Error("Could not verify the user's role.");
    }
    if (targetRole) {
      throw new Error("Administrator accounts cannot be deleted.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error("The user account could not be deleted.");

    return { userId: data.userId };
  });
