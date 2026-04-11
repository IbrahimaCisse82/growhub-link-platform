import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_PASSWORD = "GrowHub!Demo2026#Secure";

const DEMO_ACCOUNTS: Record<string, { email: string; name: string; role: string }> = {
  startup: { email: "sophie.martin@demo.com", name: "Sophie Martin", role: "startup" },
  mentor: { email: "marc.dubois@demo.com", name: "Marc Dubois", role: "mentor" },
  investor: { email: "claire.bernard@demo.com", name: "Claire Bernard", role: "investor" },
  expert: { email: "thomas.petit@demo.com", name: "Thomas Petit", role: "expert" },
  freelance: { email: "aida.saidi@demo.com", name: "Aïda Saïdi", role: "freelance" },
  incubateur: { email: "fatou.diallo@demo.com", name: "Fatou Diallo", role: "incubateur" },
  etudiant: { email: "youssef.benali@demo.com", name: "Youssef Ben Ali", role: "etudiant" },
  professionnel: { email: "amara.kone@demo.com", name: "Amara Koné", role: "professionnel" },
  corporate: { email: "nadia.okafor@demo.com", name: "Nadia Okafor", role: "corporate" },
  aspirationnel: { email: "kwame.asante@demo.com", name: "Kwame Asante", role: "aspirationnel" },
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

    // Step 1: Find user via profile display_name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("display_name", name)
      .maybeSingle();

    let userId: string | null = null;

    // Step 2: Verify auth user exists
    if (profile?.user_id) {
      try {
        const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        if (!error && authUser?.user) {
          userId = authUser.user.id;
        }
      } catch {
        // Auth user doesn't exist for this profile
      }
    }

    // Step 3: If no auth user, create one
    if (!userId) {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

      if (createErr) {
        if (createErr.message?.includes("already")) {
          return new Response(JSON.stringify({ error: "Demo account conflict. Please contact support." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw createErr;
      }

      userId = newUser.user.id;

      // The handle_new_user trigger auto-creates a profile and assigns 'startup' role.
      // Set the correct role if needed.
      if (role !== "startup") {
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: userId, role: account.role },
          { onConflict: "user_id,role" }
        );
      }
    }

    // Step 4: Ensure correct role exists
    const { data: existingRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const hasCorrectRole = existingRoles?.some((r) => r.role === account.role);
    if (!hasCorrectRole) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: account.role },
        { onConflict: "user_id,role" }
      );
    }

    // Step 5: Reset password & confirm
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
