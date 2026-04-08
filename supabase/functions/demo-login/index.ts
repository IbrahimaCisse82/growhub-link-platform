import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_PASSWORD = "GrowHub!Demo2026#Secure";

const DEMO_ACCOUNTS: Record<string, string> = {
  startup: "sophie.martin@demo.com",
  mentor: "marc.dubois@demo.com",
  investor: "claire.bernard@demo.com",
  expert: "thomas.petit@demo.com",
  freelance: "aida.saidi@demo.com",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role } = await req.json();
    const email = DEMO_ACCOUNTS[role];
    if (!email) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user ID from profiles table
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .ilike("display_name", email.split("@")[0].replace(".", " ").replace(/\b\w/g, c => c.toUpperCase()))
      .maybeSingle();

    // Fallback: query auth.users via admin API with pagination
    let userId: string | null = profile?.user_id || null;
    
    if (!userId) {
      // Try to find by listing users page by page
      let page = 1;
      const perPage = 50;
      while (true) {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        const found = users.find(u => u.email === email);
        if (found) { userId = found.id; break; }
        if (users.length < perPage) break;
        page++;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Demo user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reset password
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ email, password: DEMO_PASSWORD }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Demo login error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
