import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

export function useCoachReviews(coachId: string | null) {
  return useQuery({
    queryKey: ["coach-reviews", coachId],
    enabled: !!coachId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_reviews")
        .select("*")
        .eq("coach_id", coachId!)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const reviewerIds = data.map(r => r.reviewer_id);
      const profiles = await fetchProfilesByUserIds(reviewerIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      return data.map(r => ({ ...r, reviewer_profile: profileMap[r.reviewer_id] || null }));
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ coachId, sessionId, rating, reviewText }: {
      coachId: string; sessionId?: string; rating: number; reviewText?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("coach_reviews").insert({
        coach_id: coachId,
        session_id: sessionId,
        reviewer_id: user.id,
        rating,
        review_text: reviewText,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-reviews"] }),
  });
}

export function useCollaborations(userId: string | null) {
  return useQuery({
    queryKey: ["collaborations", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborations")
        .select("*")
        .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const allUserIds = [...new Set(data.flatMap(c => [c.user_id, c.partner_id]))];
      const profiles = await fetchProfilesByUserIds(allUserIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      return data.map(c => ({
        ...c,
        user_profile: profileMap[c.user_id] || null,
        partner_profile: profileMap[c.partner_id] || null,
      }));
    },
  });
}
