import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

function generateCode() {
  return "GH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useReferralCode() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["referral-code", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Find existing code or create one
      const { data: existing } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", user!.id)
        .limit(1)
        .maybeSingle();
      if (existing) return existing.referral_code;
      // Create new
      const code = generateCode();
      await supabase.from("referrals").insert({ referrer_id: user!.id, referral_code: code });
      return code;
    },
  });
}

export function useReferralStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["referral-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id);
      const all = data ?? [];
      return {
        total: all.length,
        converted: all.filter(r => r.status === "converted").length,
        pending: all.filter(r => r.status === "pending").length,
      };
    },
  });
}
