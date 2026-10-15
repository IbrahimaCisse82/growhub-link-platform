import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Admin-only: validate caller JWT and role
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Non autorisé" }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Non autorisé" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Accès réservé aux administrateurs" }, 403);

    const { data: profiles } = await supabase.from("profiles").select("user_id").limit(500);
    if (!profiles?.length) return json({ message: "No users to notify" });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let notified = 0;

    for (const profile of profiles) {
      const [newConns, newPosts, newSessions] = await Promise.all([
        supabase.from("connections").select("id", { count: "exact", head: true })
          .or(`requester_id.eq.${profile.user_id},receiver_id.eq.${profile.user_id}`)
          .eq("status", "accepted").gte("updated_at", oneWeekAgo),
        // Only the user's own posts, not the whole platform
        supabase.from("posts").select("id", { count: "exact", head: true })
          .eq("author_id", profile.user_id).gte("created_at", oneWeekAgo),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true })
          .eq("learner_id", profile.user_id).gte("created_at", oneWeekAgo),
      ]);

      const c = newConns.count ?? 0, p = newPosts.count ?? 0, s = newSessions.count ?? 0;
      if (c + p + s === 0) continue;
      const parts: string[] = [];
      if (c) parts.push(`${c} nouvelle(s) connexion(s)`);
      if (p) parts.push(`${p} publication(s)`);
      if (s) parts.push(`${s} session(s) de coaching`);

      await supabase.from("notifications").insert({
        user_id: profile.user_id,
        type: "system",
        title: "📊 Votre résumé hebdomadaire",
        message: `Cette semaine : ${parts.join(", ")}. Continuez à développer votre réseau !`,
        reference_type: "weekly_digest",
      });
      notified++;
    }

    return json({ message: `Digest sent to ${notified} users` });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
