import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// ─── Helper: fetch profiles by user IDs ─────────────────
async function fetchProfilesByUserIds(userIds: string[]) {
  if (userIds.length === 0) return [];
  const { data } = await supabase.from("profiles").select("*").in("user_id", userIds);
  return data ?? [];
}

// ─── Dashboard stats ────────────────────────────────────
export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [connectionsRes, sessionsRes, objectivesRes, postsRes] = await Promise.all([
        supabase.from("connections").select("id, status").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
        supabase.from("coaching_sessions").select("id, status, rating").eq("learner_id", user!.id),
        supabase.from("objectives").select("id, is_completed, current_value, target_value").eq("user_id", user!.id),
        supabase.from("posts").select("id", { count: "exact", head: true }),
      ]);

      const connections = connectionsRes.data ?? [];
      const sessions = sessionsRes.data ?? [];
      const objectives = objectivesRes.data ?? [];

      const acceptedConnections = connections.filter(c => c.status === "accepted").length;
      const pendingConnections = connections.filter(c => c.status === "pending").length;
      const completedSessions = sessions.filter(s => s.status === "completed").length;
      const ratedSessions = sessions.filter(s => s.rating);
      const avgRating = ratedSessions.length > 0
        ? (ratedSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) / ratedSessions.length).toFixed(1)
        : "—";
      const completedObjectives = objectives.filter(o => o.is_completed).length;
      const objectivePct = objectives.length > 0 ? Math.round((completedObjectives / objectives.length) * 100) : 0;

      return {
        connections: acceptedConnections,
        pendingConnections,
        completedSessions,
        avgRating,
        totalObjectives: objectives.length,
        completedObjectives,
        objectivePct,
        totalPosts: postsRes.count ?? 0,
      };
    },
  });
}

// ─── Profiles (for networking suggestions) ──────────────
export function useProfiles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profiles"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user!.id)
        .eq("is_public", true)
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

// ─── Connections ────────────────────────────────────────
export function useConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);
      if (error) throw error;
      return data;
    },
  });
}

export function usePendingRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pending-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("receiver_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch requester profiles
      const requesterIds = data.map(c => c.requester_id);
      const profiles = await fetchProfilesByUserIds(requesterIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => ({
        ...c,
        requester_profile: profileMap[c.requester_id] ?? null,
      }));
    },
  });
}

export function useSendConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ receiverId, matchScore }: { receiverId: string; matchScore?: number }) => {
      const { error } = await supabase.from("connections").insert({
        requester_id: user!.id,
        receiver_id: receiverId,
        match_score: matchScore,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });
}

export function useRespondConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: "accepted" | "rejected" }) => {
      const { error } = await supabase.from("connections").update({ status }).eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ─── Coaches ────────────────────────────────────────────
export function useCoaches() {
  return useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch coach profiles
      const userIds = data.map(c => c.user_id);
      const profiles = await fetchProfilesByUserIds(userIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => ({
        ...c,
        profile: profileMap[c.user_id] ?? null,
      }));
    },
  });
}

// ─── Coaching sessions ─────────────────────────────────
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

      // Fetch coach details
      const coachIds = [...new Set(data.map(s => s.coach_id))];
      const { data: coaches } = await supabase.from("coaches").select("*").in("id", coachIds);
      const coachMap = Object.fromEntries((coaches ?? []).map(c => [c.id, c]));

      // Fetch coach profiles
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

// ─── Events ─────────────────────────────────────────────
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

      // Fetch registrations for these events
      const eventIds = data.map(e => e.id);
      const { data: regs } = await supabase.from("event_registrations").select("*").in("event_id", eventIds);
      const regMap = new Map<string, typeof regs>();
      (regs ?? []).forEach(r => {
        if (!regMap.has(r.event_id)) regMap.set(r.event_id, []);
        regMap.get(r.event_id)!.push(r);
      });

      return data.map(e => ({
        ...e,
        registrations: regMap.get(e.id) ?? [],
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
    },
  });
}

// ─── Objectives ─────────────────────────────────────────
export function useObjectives() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["objectives", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objectives")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Notifications ──────────────────────────────────────
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

// ─── Posts (Feed) ───────────────────────────────────────
export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch author profiles
      const authorIds = [...new Set(data.map(p => p.author_id))];
      const profiles = await fetchProfilesByUserIds(authorIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(p => ({
        ...p,
        author: profileMap[p.author_id] ?? null,
      }));
    },
  });
}
