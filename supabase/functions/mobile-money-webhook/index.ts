// Mobile Money webhook — receives provider callbacks (Wave / Orange Money / MTN MoMo)
// and updates the corresponding coaching_payments row.
// Public endpoint (verify_jwt = false). Provider signs payload with HMAC; verify with shared secret.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-provider-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type Provider = "wave" | "orange_money" | "mtn_momo";

interface WebhookBody {
  provider: Provider;
  reference: string;          // provider_reference from coaching_payments
  status: "paid" | "failed" | "pending";
  amount?: number;
  currency?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as WebhookBody;
    if (!body?.provider || !body?.reference || !body?.status) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // (Optional) HMAC signature verification per provider — skipped here, providers' shared
    // secret should be added via add_secret and validated against `x-provider-signature`.

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const update: Record<string, unknown> = { status: body.status, updated_at: new Date().toISOString() };
    if (body.status === "paid") update.paid_at = new Date().toISOString();

    const { error } = await supabase
      .from("coaching_payments")
      .update(update)
      .eq("provider", body.provider)
      .eq("provider_reference", body.reference);

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
