import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export type KYCStatus = "pending" | "verified" | "rejected";

export interface KYCRecord {
  id: string;
  user_id: string;
  status: KYCStatus;
  document_type: string | null;
  document_url: string | null;
  notes: string | null;
  submitted_at: string;
  verified_at: string | null;
}

export function useKYC() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const qc = useQueryClient();

  const requiresKYC = role === "investor" || role === "corporate";

  const query = useQuery({
    queryKey: ["kyc", user?.id],
    enabled: !!user && requiresKYC,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as KYCRecord | null;
    },
  });

  const submit = useMutation({
    mutationFn: async (payload: { document_type: string; document_url?: string; notes?: string }) => {
      if (!user) throw new Error("Non authentifié");
      const { error } = await (supabase as any).from("kyc_verifications").upsert({
        user_id: user.id,
        status: "pending",
        ...payload,
      }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kyc"] }),
  });

  return { kyc: query.data, isLoading: query.isLoading, requiresKYC, submit };
}
