import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

export function useCoaches() {
  return useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coaches").select("*").eq("is_active", true);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const userIds = data.map(c => c.user_id);
      const profiles = await fetchProfilesByUserIds(userIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => ({ ...c, profile: profileMap[c.user_id] ?? null }));
    },
  });
}

export function useCoachingSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["coaching-sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*")
        .eq("learner_id", user!.id)
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const coachIds = [...new Set(data.map(s => s.coach_id))];
      const { data: coaches } = await supabase.from("coaches").select("*").in("id", coachIds);
      const coachMap = Object.fromEntries((coaches ?? []).map(c => [c.id, c]));

      const coachUserIds = (coaches ?? []).map(c => c.user_id);
      const profiles = await fetchProfilesByUserIds(coachUserIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(s => {
        const coach = coachMap[s.coach_id];
        return {
          ...s,
          coach_profile: coach ? profileMap[coach.user_id] ?? null : null,
          coach_data: coach ?? null,
        };
      });
    },
  });
}

export function useBookSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ coachId, scheduledAt, topic, durationMinutes }: { coachId: string; scheduledAt: string; topic?: string; durationMinutes?: number }) => {
      const { error } = await supabase.from("coaching_sessions").insert({
        coach_id: coachId,
        learner_id: user!.id,
        scheduled_at: scheduledAt,
        topic: topic || "Session de coaching",
        duration_minutes: durationMinutes || 60,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.from("coaching_sessions").update({ status: "cancelled" as any }).eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
    },
  });
}

export function useRateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, rating, feedback }: { sessionId: string; rating: number; feedback?: string }) => {
      const { error } = await supabase.from("coaching_sessions").update({ rating, feedback }).eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
