import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    staleTime: 1000 * 60 * 5, // 5 min cache
    queryFn: async () => {
      const [profilesRes, coachesRes, eventsRes, connectionsRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("coaches").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);

      return {
        totalMembers: profilesRes.count ?? 0,
        totalCoaches: coachesRes.count ?? 0,
        totalEvents: eventsRes.count ?? 0,
        totalConnections: connectionsRes.count ?? 0,
        totalSessions: sessionsRes.count ?? 0,
      };
    },
  });
}

export function usePlatformTestimonials() {
  return useQuery({
    queryKey: ["platform-testimonials"],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      // Fetch real public coach reviews with high ratings
      const { data: reviews } = await supabase
        .from("coach_reviews")
        .select("rating, review_text, reviewer_id, created_at")
        .eq("is_public", true)
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!reviews || reviews.length === 0) return [];

      const userIds = reviews.map(r => r.reviewer_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, headline, avatar_url")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]));

      return reviews.map(r => ({
        name: profileMap[r.reviewer_id]?.display_name ?? "Membre",
        role: profileMap[r.reviewer_id]?.headline ?? "",
        text: r.review_text ?? "",
        avatar: (profileMap[r.reviewer_id]?.display_name ?? "M").split(" ").map(w => w[0]).join("").substring(0, 2),
        avatarUrl: profileMap[r.reviewer_id]?.avatar_url ?? null,
        rating: r.rating,
      }));
    },
  });
}
