import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(12);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const eventIds = data.map(e => e.id);
      const { data: regs } = await supabase.from("event_registrations").select("*").in("event_id", eventIds);
      const regMap = new Map<string, typeof regs>();
      (regs ?? []).forEach(r => {
        if (!regMap.has(r.event_id)) regMap.set(r.event_id, []);
        regMap.get(r.event_id)!.push(r);
      });

      const organizerIds = [...new Set(data.map(e => e.organizer_id))];
      const profiles = await fetchProfilesByUserIds(organizerIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(e => ({
        ...e,
        registrations: regMap.get(e.id) ?? [],
        organizer_profile: profileMap[e.organizer_id] ?? null,
      }));
    },
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUnregisterEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
