import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.3";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return respond({ error: "Authentication is required." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond({ error: "Invalid request body." }, 400);
  }
  const beatId =
    body && typeof body === "object" && "beatId" in body && typeof body.beatId === "string"
      ? body.beatId
      : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(beatId)) {
    return respond({ error: "Invalid beat ID." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");
  if (
    !supabaseUrl ||
    !publicKey ||
    !serviceKey ||
    !vapidPublicKey ||
    !vapidPrivateKey ||
    !vapidSubject
  ) {
    console.error("Required Push notification environment is missing.");
    return respond({ error: "Push notifications are not configured on the server." }, 500);
  }

  const userClient = createClient(supabaseUrl, publicKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return respond({ error: "Authentication is invalid." }, 401);

  const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleError || !isAdmin) return respond({ error: "Administrator access is required." }, 403);

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: beat, error: beatError } = await adminClient
    .from("beats")
    .select("id, title, slug, status")
    .eq("id", beatId)
    .maybeSingle();
  if (beatError) {
    console.error("Could not load the beat for Push delivery.", beatError);
    return respond({ error: "The published beat could not be verified." }, 500);
  }
  if (!beat || beat.status !== "published") {
    return respond({ error: "Only published beats can be announced." }, 400);
  }

  const { data: subscriptions, error: subscriptionsError } = await adminClient
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");
  if (subscriptionsError) {
    console.error("Could not load Push subscriptions.", subscriptionsError);
    return respond({ error: "Push subscriptions could not be loaded." }, 500);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const payload = JSON.stringify({
    id: beat.id,
    title: `Nouveau beat : ${beat.title}`,
    body: "Écoutez-le dès maintenant sur Dany Beats.",
    url: `/beats/${encodeURIComponent(beat.slug)}`,
  });
  let sent = 0;
  let failed = 0;
  for (const subscription of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
        { TTL: 60 * 60 * 24 },
      );
      sent++;
    } catch (error) {
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? error.statusCode
          : undefined;
      if (statusCode === 404 || statusCode === 410) {
        const { error: deleteError } = await adminClient
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);
        if (deleteError) console.error("Could not remove an expired Push subscription.", deleteError);
      } else {
        console.error("Push delivery failed for a subscription.", error);
      }
      failed++;
    }
  }

  return respond({ sent, failed });
});
