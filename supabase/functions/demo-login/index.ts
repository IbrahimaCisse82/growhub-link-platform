import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_PASSWORD = "GrowHub!Demo2026#Secure";

const DEMO_ACCOUNTS: Record<string, { email: string; name: string }> = {
  startup: { email: "sophie.martin@demo.com", name: "Sophie Martin" },
  mentor: { email: "marc.dubois@demo.com", name: "Marc Dubois" },
  investor: { email: "claire.bernard@demo.com", name: "Claire Bernard" },
  expert: { email: "thomas.petit@demo.com", name: "Thomas Petit" },
  freelance: { email: "aida.saidi@demo.com", name: "Aïda Saïdi" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role } = await req.json();
    const account = DEMO_ACCOUNTS[role];
    if (!account) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email, name } = account;

    // Try to find user by profile display_name first
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("display_name", name)
      .maybeSingle();

    let userId: string | null = profile?.user_id || null;

    // Verify the auth user actually exists for this user_id
    if (userId) {
      const { data: authUser, error: getUserErr } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (getUserErr || !authUser?.user) {
        userId = null; // Auth user doesn't exist, need to create
      }
    }

    // If no valid auth user found, create one
    if (!userId) {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (createErr) {
        // User might already exist with this email
        if (createErr.message?.includes("already been registered")) {
          // Find existing user - try getUserByEmail approach via listing
          const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          if (listErr) throw listErr;
          const found = users.find(u => u.email === email);
          if (found) {
            userId = found.id;
          } else {
            throw new Error("User registered but not found");
          }
        } else {
          throw createErr;
        }
      } else {
        userId = newUser.user.id;
        
        // Update profile to link to new auth user if old seeded profile exists
        if (profile?.user_id && profile.user_id !== userId) {
          // Update the profile's user_id to the real auth user
          await supabaseAdmin
            .from("profiles")
            .update({ user_id: userId })
            .eq("user_id", profile.user_id);
          // Update user_roles too
          await supabaseAdmin
            .from("user_roles")
            .update({ user_id: userId })
            .eq("user_id", profile.user_id);
        }
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Demo user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reset password and confirm email
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
