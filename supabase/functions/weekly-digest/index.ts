import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all users with profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .limit(500);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users to notify" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let notified = 0;

    for (const profile of profiles) {
      // Get weekly stats
      const [newConns, newPosts, newSessions] = await Promise.all([
        supabase.from("connections")
          .select("id", { count: "exact", head: true })
          .or(`requester_id.eq.${profile.user_id},receiver_id.eq.${profile.user_id}`)
          .eq("status", "accepted")
          .gte("updated_at", oneWeekAgo),
        supabase.from("posts")
          .select("id", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo),
        supabase.from("coaching_sessions")
          .select("id", { count: "exact", head: true })
          .eq("learner_id", profile.user_id)
          .gte("created_at", oneWeekAgo),
      ]);

      const connCount = newConns.count ?? 0;
      const postCount = newPosts.count ?? 0;
      const sessionCount = newSessions.count ?? 0;

      // Only send if there's activity
      if (connCount > 0 || postCount > 0 || sessionCount > 0) {
        const parts = [];
        if (connCount > 0) parts.push(`${connCount} nouvelle(s) connexion(s)`);
        if (postCount > 0) parts.push(`${postCount} publication(s) dans le feed`);
        if (sessionCount > 0) parts.push(`${sessionCount} session(s) de coaching`);

        await supabase.from("notifications").insert({
          user_id: profile.user_id,
          type: "system",
          title: "📊 Votre résumé hebdomadaire",
          message: `Cette semaine : ${parts.join(", ")}. Continuez à développer votre réseau !`,
          reference_type: "weekly_digest",
        });
        notified++;
      }
    }

    return new Response(JSON.stringify({ message: `Digest sent to ${notified} users` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
