import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface MatchedProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  company_name: string | null;
  sector: string | null;
  skills: string[];
  interests: string[];
  city: string | null;
  company_stage: string | null;
  match_score: number;
  match_reasons: string[];
}

function computeMatchScore(
  me: { skills: string[]; interests: string[]; sector: string | null; city: string | null; company_stage: string | null },
  other: { skills: string[]; interests: string[]; sector: string | null; city: string | null; company_stage: string | null }
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Complementary skills (their skills match my interests)
  const myInterests = new Set((me.interests ?? []).map(i => i.toLowerCase()));
  const theirSkills = new Set((other.skills ?? []).map(s => s.toLowerCase()));
  const skillMatch = [...myInterests].filter(i => theirSkills.has(i)).length;
  if (skillMatch > 0) {
    score += skillMatch * 15;
    reasons.push(`${skillMatch} compétence${skillMatch > 1 ? "s" : ""} complémentaire${skillMatch > 1 ? "s" : ""}`);
  }

  // Shared interests
  const theirInterests = new Set((other.interests ?? []).map(i => i.toLowerCase()));
  const sharedInterests = [...myInterests].filter(i => theirInterests.has(i)).length;
  if (sharedInterests > 0) {
    score += sharedInterests * 10;
    reasons.push(`${sharedInterests} intérêt${sharedInterests > 1 ? "s" : ""} en commun`);
  }

  // Same sector
  if (me.sector && other.sector && me.sector.toLowerCase() === other.sector.toLowerCase()) {
    score += 20;
    reasons.push("Même secteur");
  }

  // Same city
  if (me.city && other.city && me.city.toLowerCase() === other.city.toLowerCase()) {
    score += 10;
    reasons.push("Même ville");
  }

  // Different stage (complementarity)
  if (me.company_stage && other.company_stage && me.company_stage !== other.company_stage) {
    score += 5;
    reasons.push("Stade complémentaire");
  }

  return { score: Math.min(score, 100), reasons };
}

export function useMatching(limit = 10) {
  const { user, profile } = useAuth();
  return useQuery({
    queryKey: ["matching", user?.id],
    enabled: !!user && !!profile,
    queryFn: async () => {
      // Fetch all public profiles except me
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, company_name, sector, skills, interests, city, company_stage")
        .neq("user_id", user!.id)
        .eq("is_public", true)
        .limit(100);
      if (error) throw error;

      // Get existing connections to exclude
      const { data: connections } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);

      const connectedIds = new Set(
        (connections ?? []).flatMap(c => [c.requester_id, c.receiver_id]).filter(id => id !== user!.id)
      );

      const me = {
        skills: profile!.skills ?? [],
        interests: profile!.interests ?? [],
        sector: profile!.sector ?? null,
        city: profile!.city ?? null,
        company_stage: profile!.company_stage ?? null,
      };

      const scored: MatchedProfile[] = (profiles ?? [])
        .filter(p => !connectedIds.has(p.user_id))
        .map(p => {
          const { score, reasons } = computeMatchScore(me, {
            skills: p.skills ?? [],
            interests: p.interests ?? [],
            sector: p.sector,
            city: p.city,
            company_stage: p.company_stage,
          });
          return { ...p, skills: p.skills ?? [], interests: p.interests ?? [], match_score: score, match_reasons: reasons };
        })
        .filter(p => p.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit);

      return scored;
    },
    staleTime: 60_000,
  });
}
