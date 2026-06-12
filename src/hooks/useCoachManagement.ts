import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// ---- Current user's coach row ----
export function useMyCoach() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-coach", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ---- Availability ----
export function useCoachAvailability(coachId?: string) {
  return useQuery({
    queryKey: ["coach-availability", coachId],
    enabled: !!coachId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_availability" as any)
        .select("*")
        .eq("coach_id", coachId!)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useAddAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { coachId: string; dayOfWeek: number; start: string; end: string; timezone?: string }) => {
      const { error } = await supabase.from("coach_availability" as any).insert({
        coach_id: p.coachId,
        day_of_week: p.dayOfWeek,
        start_time: p.start,
        end_time: p.end,
        timezone: p.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-availability"] }),
  });
}

export function useDeleteAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coach_availability" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-availability"] }),
  });
}

// ---- Payouts ----
export function useMyPayouts(coachId?: string) {
  return useQuery({
    queryKey: ["coach-payouts", coachId],
    enabled: !!coachId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_payout_requests" as any)
        .select("*")
        .eq("coach_id", coachId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { coachId: string; amount: number; currency?: string; method: string; account?: string }) => {
      const { error } = await supabase.from("coach_payout_requests" as any).insert({
        coach_id: p.coachId,
        amount: p.amount,
        currency: p.currency ?? "XOF",
        method: p.method,
        account_details: p.account,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-payouts"] }),
  });
}

// ---- Applications ----
export function useMyCoachApplication() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["coach-application", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_applications" as any)
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}

export function useSubmitCoachApplication() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: { bio: string; specialties: string[]; languages: string[]; hourlyRate?: number; currency?: string; yearsExperience?: number; linkedinUrl?: string }) => {
      const { error } = await supabase.from("coach_applications" as any).insert({
        user_id: user!.id,
        bio: p.bio,
        specialties: p.specialties,
        languages: p.languages,
        hourly_rate: p.hourlyRate,
        currency: p.currency ?? "XOF",
        years_experience: p.yearsExperience,
        linkedin_url: p.linkedinUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-application"] }),
  });
}
