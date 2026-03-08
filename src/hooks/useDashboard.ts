import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
