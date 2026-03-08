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
      const [connectionsRes, sessionsRes, objectivesRes, postsRes, badgesRes, eventsRes] = await Promise.all([
        supabase.from("connections").select("id, status").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
        supabase.from("coaching_sessions").select("id, status, rating").eq("learner_id", user!.id),
        supabase.from("objectives").select("id, is_completed, current_value, target_value").eq("user_id", user!.id),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("user_badges").select("id").eq("user_id", user!.id),
        supabase.from("event_registrations").select("id").eq("user_id", user!.id),
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
        totalBadges: badgesRes.data?.length ?? 0,
        totalEvents: eventsRes.data?.length ?? 0,
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

      if (!data || data.length === 0) return [];
      const partnerIds = data.map(c => c.requester_id === user!.id ? c.receiver_id : c.requester_id);
      const profiles = await fetchProfilesByUserIds(partnerIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => {
        const partnerId = c.requester_id === user!.id ? c.receiver_id : c.requester_id;
        return { ...c, partner_profile: profileMap[partnerId] ?? null };
      });
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
    mutationFn: async ({ receiverId, matchScore, message }: { receiverId: string; matchScore?: number; message?: string }) => {
      const { error } = await supabase.from("connections").insert({
        requester_id: user!.id,
        receiver_id: receiverId,
        match_score: matchScore,
        message,
      });
      if (error) throw error;
      // Create notification
      await supabase.from("notifications").insert({
        user_id: receiverId,
        type: "connection_request" as any,
        title: "Nouvelle demande de connexion",
        message: `${user!.email} souhaite se connecter avec vous`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });
}

export function useRespondConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ connectionId, status, requesterId }: { connectionId: string; status: "accepted" | "rejected"; requesterId?: string }) => {
      const { error } = await supabase.from("connections").update({ status }).eq("id", connectionId);
      if (error) throw error;
      if (status === "accepted" && requesterId) {
        await supabase.from("notifications").insert({
          user_id: requesterId,
          type: "connection_accepted" as any,
          title: "Connexion acceptée !",
          message: `Votre demande a été acceptée`,
        });
      }
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

export function useCreateObjective() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (obj: { title: string; description?: string; category?: string; target_value?: number; deadline?: string }) => {
      const { error } = await supabase.from("objectives").insert({ ...obj, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; current_value?: number; is_completed?: boolean; title?: string }) => {
      const { error } = await supabase.from("objectives").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("objectives").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
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
        .limit(50);
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
        .limit(30);
      if (error) throw error;
      if (!data || data.length === 0) return [];

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

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, emoji }: { postId: string; emoji?: string }) => {
      const { data: existing } = await supabase
        .from("post_reactions")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        await supabase.from("post_reactions").delete().eq("id", existing.id);
        await supabase.rpc("decrement_post_likes", { post_id: postId });
      } else {
        await supabase.from("post_reactions").insert({ post_id: postId, user_id: user!.id, emoji: emoji || "👍" });
        await supabase.rpc("increment_post_likes", { post_id: postId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-reactions"] });
    },
  });
}

export function useUserReactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["post-reactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("post_reactions")
        .select("post_id, emoji")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });
}

export function useComments(postId: string | null) {
  return useQuery({
    queryKey: ["comments", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const authorIds = [...new Set(data.map(c => c.author_id))];
      const profiles = await fetchProfilesByUserIds(authorIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => ({
        ...c,
        author: profileMap[c.author_id] ?? null,
      }));
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: user!.id,
        content,
      });
      if (error) throw error;
      await supabase.rpc("increment_post_comments", { post_id: postId });
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ─── Badges ─────────────────────────────────────────────
export function useUserBadges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-badges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}
