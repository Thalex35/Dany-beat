import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const userId =
    body && typeof body === "object" && "userId" in body && typeof body.userId === "string"
      ? body.userId
      : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return jsonResponse({ error: "Invalid user ID." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");
  if (!supabaseUrl || !publicKey || !serviceKey) {
    console.error("Required Supabase Edge Function environment is missing.");
    return jsonResponse({ error: "User deletion is not configured on the server." }, 500);
  }

  const userClient = createClient(supabaseUrl, publicKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: "Authentication is invalid or expired." }, 401);
  }

  const { data: callerIsAdmin, error: callerRoleError } = await userClient.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (callerRoleError || !callerIsAdmin) {
    return jsonResponse({ error: "Administrator access is required." }, 403);
  }

  if (userData.user.id === userId) {
    return jsonResponse({ error: "You cannot delete your own account here." }, 403);
  }

  const { data: targetAdmin, error: targetRoleError } = await userClient
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (targetRoleError) {
    return jsonResponse({ error: "Could not verify the target user's role." }, 500);
  }
  if (targetAdmin) {
    return jsonResponse({ error: "Administrator accounts cannot be deleted." }, 403);
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteError) {
    return jsonResponse({ error: "The user account could not be deleted." }, 500);
  }

  return jsonResponse({ userId });
});
