import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfilesByUserIds } from "@/hooks/useProfiles";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users } from "lucide-react";

interface EventMatchProps {
  eventId: string;
  registrations: any[];
}

export default function EventMatchmaking({ eventId, registrations }: EventMatchProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const participantIds = registrations
    .map((r: any) => r.user_id)
    .filter((id: string) => id !== user?.id);

  const { data: matchedParticipants, isLoading } = useQuery({
    queryKey: ["event-matchmaking", eventId, user?.id],
    enabled: !!user && !!profile && participantIds.length > 0,
    queryFn: async () => {
      const profiles = await fetchProfilesByUserIds(participantIds.slice(0, 20));
      
      const mySkills = new Set((profile!.skills ?? []).map(s => s.toLowerCase()));
      const myInterests = new Set((profile!.interests ?? []).map(i => i.toLowerCase()));

      return profiles
        .map(p => {
          let score = 0;
          const reasons: string[] = [];

          const theirSkills = (p.skills ?? []).map((s: string) => s.toLowerCase());
          const matchedSkills = theirSkills.filter((s: string) => myInterests.has(s)).length;
          if (matchedSkills > 0) { score += matchedSkills * 15; reasons.push(`${matchedSkills} compétence(s) complémentaire(s)`); }

          if (p.sector && profile!.sector && p.sector.toLowerCase() === profile!.sector.toLowerCase()) {
            score += 20; reasons.push("Même secteur");
          }

          if (p.city && profile!.city && p.city.toLowerCase() === profile!.city.toLowerCase()) {
            score += 10; reasons.push("Même ville");
          }

          return { ...p, match_score: Math.min(score, 100), match_reasons: reasons };
        })
        .filter(p => p.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Skeleton className="h-20 rounded-xl" />;
  if (!matchedParticipants || matchedParticipants.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Participants à rencontrer</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {matchedParticipants.map(p => (
          <button
            key={p.user_id}
            onClick={() => navigate(`/profile/${p.user_id}`)}
            className="flex-shrink-0 flex items-center gap-2 bg-secondary/50 rounded-lg px-2.5 py-1.5 hover:bg-primary/10 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
              {p.display_name.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold truncate max-w-[80px]">{p.display_name}</div>
              <div className="text-[8px] text-primary font-bold">{p.match_score}% match</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
