import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SSIData {
  totalScore: number;
  profileStrength: number;
  networkQuality: number;
  engagement: number;
  visibility: number;
  details: {
    hasAvatar: boolean;
    hasBio: boolean;
    hasSkills: boolean;
    hasInterests: boolean;
    hasLinkedin: boolean;
    hasWebsite: boolean;
    connectionCount: number;
    postCount: number;
    commentCount: number;
    reactionCount: number;
    profileViews: number;
    endorsementsReceived: number;
    eventsAttended: number;
    coachingSessions: number;
  };
  weeklyChange: number;
}

export function useSSI() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["ssi", user?.id],
    enabled: !!user && !!profile,
    queryFn: async (): Promise<SSIData> => {
      const [connectionsRes, postsRes, commentsRes, reactionsRes, endorsementsRes, eventsRes, sessionsRes] = await Promise.all([
        supabase.from("connections").select("id").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted"),
        supabase.from("posts").select("id").eq("author_id", user!.id),
        supabase.from("comments").select("id").eq("author_id", user!.id),
        supabase.from("post_reactions").select("id").eq("user_id", user!.id),
        supabase.from("endorsements").select("id").eq("endorsed_id", user!.id),
        supabase.from("event_registrations").select("id").eq("user_id", user!.id),
        supabase.from("coaching_sessions").select("id").eq("learner_id", user!.id).eq("status", "completed"),
      ]);

      const connectionCount = connectionsRes.data?.length ?? 0;
      const postCount = postsRes.data?.length ?? 0;
      const commentCount = commentsRes.data?.length ?? 0;
      const reactionCount = reactionsRes.data?.length ?? 0;
      const endorsementsReceived = endorsementsRes.data?.length ?? 0;
      const eventsAttended = eventsRes.data?.length ?? 0;
      const coachingSessions = sessionsRes.data?.length ?? 0;

      // Profile Strength (0-25)
      const hasAvatar = !!profile!.avatar_url;
      const hasBio = !!profile!.bio && profile!.bio.length > 20;
      const hasSkills = (profile!.skills ?? []).length >= 3;
      const hasInterests = (profile!.interests ?? []).length >= 2;
      const hasLinkedin = !!profile!.linkedin_url;
      const hasWebsite = !!profile!.website_url;
      const profileChecks = [hasAvatar, hasBio, hasSkills, hasInterests, hasLinkedin, hasWebsite];
      const profileStrength = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 25);

      // Network Quality (0-25)
      const networkQuality = Math.min(25, Math.round(
        (Math.min(connectionCount, 50) / 50) * 15 +
        (Math.min(endorsementsReceived, 20) / 20) * 10
      ));

      // Engagement (0-25)
      const engagement = Math.min(25, Math.round(
        (Math.min(postCount, 20) / 20) * 8 +
        (Math.min(commentCount, 50) / 50) * 7 +
        (Math.min(reactionCount, 50) / 50) * 5 +
        (Math.min(eventsAttended, 10) / 10) * 5
      ));

      // Visibility (0-25)
      const profileViews = profile!.profile_views ?? 0;
      const visibility = Math.min(25, Math.round(
        (Math.min(profileViews, 100) / 100) * 15 +
        (Math.min(coachingSessions, 10) / 10) * 10
      ));

      const totalScore = profileStrength + networkQuality + engagement + visibility;

      return {
        totalScore,
        profileStrength,
        networkQuality,
        engagement,
        visibility,
        details: {
          hasAvatar, hasBio, hasSkills, hasInterests, hasLinkedin, hasWebsite,
          connectionCount, postCount, commentCount, reactionCount,
          profileViews, endorsementsReceived, eventsAttended, coachingSessions,
        },
        weeklyChange: Math.round(Math.random() * 6 - 2), // placeholder
      };
    },
    staleTime: 60_000,
  });
}
