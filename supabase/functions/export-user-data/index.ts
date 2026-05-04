import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const [profile, posts, comments, connections, sessions, bookmarks, notifications] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("posts").select("*").eq("author_id", user.id),
      supabase.from("comments").select("*").eq("author_id", user.id),
      supabase.from("connections").select("*").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
      supabase.from("coaching_sessions").select("*").eq("learner_id", user.id),
      supabase.from("bookmarks").select("*").eq("user_id", user.id),
      supabase.from("notifications").select("*").eq("user_id", user.id),
    ]);

    const exportPayload = {
      exported_at: new Date().toISOString(),
      user: { id: user.id, email: user.email, created_at: user.created_at },
      profile: profile.data,
      posts: posts.data ?? [],
      comments: comments.data ?? [],
      connections: connections.data ?? [],
      coaching_sessions: sessions.data ?? [],
      bookmarks: bookmarks.data ?? [],
      notifications: notifications.data ?? [],
    };

    return new Response(JSON.stringify(exportPayload, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="growhub-export-${user.id}.json"`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
