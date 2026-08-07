// Mobile Money webhook — receives provider callbacks (Wave / Orange Money / MTN MoMo)
// and updates the corresponding coaching_payments row.
//
// Security model (public endpoint, verify_jwt = false):
//  1. HMAC-SHA256 signature verification against the shared secret MOBILE_MONEY_WEBHOOK_SECRET.
//     Fails CLOSED: if the secret is not configured, every call is rejected.
//  2. Timestamp freshness window (5 min) to block replay of a captured payload.
//  3. Idempotency: a payment already marked `paid` is never re-processed.
//  4. Strict payload validation (provider / status allow-lists).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-provider-signature, x-provider-timestamp",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const PROVIDERS = ["wave", "orange_money", "mtn_momo"] as const;
const STATUSES = ["paid", "failed", "pending", "refunded"] as const;
type Provider = (typeof PROVIDERS)[number];
type Status = (typeof STATUSES)[number];

const MAX_SKEW_MS = 5 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Constant-time comparison to avoid timing oracles on the signature. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("MOBILE_MONEY_WEBHOOK_SECRET");
  if (!secret) {
    console.error("MOBILE_MONEY_WEBHOOK_SECRET is not configured — rejecting webhook call");
    return json({ error: "Webhook not configured" }, 503);
  }

  const signature = req.headers.get("x-provider-signature");
  const timestamp = req.headers.get("x-provider-timestamp");
  if (!signature || !timestamp) return json({ error: "Missing signature headers" }, 401);

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    return json({ error: "Stale or invalid timestamp" }, 401);
  }

  const raw = await req.text();
  const expected = await hmacHex(secret, `${timestamp}.${raw}`);
  if (!safeEqual(signature.toLowerCase(), expected)) {
    console.warn("Rejected mobile-money webhook: invalid signature");
    return json({ error: "Invalid signature" }, 401);
  }

  let body: { provider?: string; reference?: string; status?: string; amount?: number };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const provider = body.provider as Provider;
  const status = body.status as Status;
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";

  if (!PROVIDERS.includes(provider)) return json({ error: "Unknown provider" }, 400);
  if (!STATUSES.includes(status)) return json({ error: "Unknown status" }, 400);
  if (!reference || reference.length > 200) return json({ error: "Invalid reference" }, 400);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existing, error: readErr } = await supabase
      .from("coaching_payments")
      .select("id, status, gross_amount")
      .eq("provider", provider)
      .eq("provider_reference", reference)
      .maybeSingle();

    if (readErr) throw readErr;
    if (!existing) return json({ error: "Unknown payment reference" }, 404);

    // Idempotency: a settled payment is terminal, duplicate callbacks are acknowledged as no-ops.
    if (existing.status === "paid" && status !== "refunded") {
      return json({ ok: true, idempotent: true });
    }

    // Sanity check: the provider must not settle a different amount than the one recorded.
    if (status === "paid" && typeof body.amount === "number") {
      const recorded = Number(existing.gross_amount ?? 0);
      if (recorded > 0 && Math.abs(recorded - body.amount) > 0.5) {
        console.error("Amount mismatch on payment", existing.id, recorded, body.amount);
        return json({ error: "Amount mismatch" }, 409);
      }
    }

    const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "paid") update.paid_at = new Date().toISOString();

    const { error } = await supabase
      .from("coaching_payments")
      .update(update)
      .eq("id", existing.id);

    if (error) throw error;

    return json({ ok: true });
  } catch (e) {
    console.error("mobile-money-webhook failure", (e as Error).message);
    return json({ error: "Internal error" }, 500);
  }
});
