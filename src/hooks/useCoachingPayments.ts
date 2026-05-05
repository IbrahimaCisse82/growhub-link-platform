import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PaymentProvider = "wave" | "orange_money" | "mtn_momo" | "card" | "stripe";

export function useCreateCoachingPayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      coachId: string;
      grossAmount: number;
      currency?: string;
      provider: PaymentProvider;
      providerReference?: string;
    }) => {
      const { error } = await supabase.from("coaching_payments" as any).insert({
        session_id: params.sessionId,
        coach_id: params.coachId,
        learner_id: user!.id,
        gross_amount: params.grossAmount,
        currency: params.currency ?? "XOF",
        provider: params.provider,
        provider_reference: params.providerReference,
        // commission_amount / net_amount are computed by DB trigger (15%)
        commission_amount: 0,
        net_amount: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["coaching-payments"] });
    },
  });
}

export function useCoachEarnings(coachId?: string) {
  return useQuery({
    queryKey: ["coach-earnings", coachId],
    enabled: !!coachId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_payments" as any)
        .select("gross_amount, net_amount, commission_amount, status, currency, paid_at, created_at")
        .eq("coach_id", coachId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as any[];
      const paid = rows.filter(r => r.status === "paid");
      return {
        rows,
        totalGross: paid.reduce((s, r) => s + Number(r.gross_amount ?? 0), 0),
        totalNet: paid.reduce((s, r) => s + Number(r.net_amount ?? 0), 0),
        totalCommission: paid.reduce((s, r) => s + Number(r.commission_amount ?? 0), 0),
        currency: rows[0]?.currency ?? "XOF",
      };
    },
  });
}

export function useOpenDispute() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: { sessionId: string; reason: string; description?: string }) => {
      const { error } = await supabase.from("coaching_disputes" as any).insert({
        session_id: p.sessionId,
        opened_by: user!.id,
        reason: p.reason,
        description: p.description,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coaching-disputes"] }),
  });
}

export function useMyDisputes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["coaching-disputes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_disputes" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
