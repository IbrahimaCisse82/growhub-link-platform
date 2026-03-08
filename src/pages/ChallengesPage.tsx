import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";
import { Trophy, Flame, Users, Target, Zap, Clock, CheckCircle } from "lucide-react";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { fr } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

const challengeIcons: Record<string, string> = {
  networking: "🤝",
  content: "✍️",
  engagement: "💬",
  events: "📅",
  coaching: "🎓",
};

export default function ChallengesPage() {
  usePageMeta({ title: "Challenges", description: "Participez aux défis communautaires et progressez ensemble." });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("challenges").select("*").eq("is_active", true).order("ends_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: participations = [] } = useQuery({
    queryKey: ["challenge-participations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any).from("challenge_participants").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["challenge-leaderboard"],
    queryFn: async () => {
      const { data } = await supabase.from("challenge_participants").select("*, profiles:user_id(display_name, avatar_url)").eq("completed", true).order("completed_at", { ascending: true }).limit(20);
      return data ?? [];
    },
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase.from("challenge_participants").insert({ challenge_id: challengeId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["challenge-participations"] }); toast.success("Défi accepté ! 🔥"); },
  });

  const myParticipationIds = new Set(participations.map((p: any) => p.challenge_id));
  const completedCount = participations.filter((p: any) => p.completed).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-br from-card to-amber-500/5 border-2 border-amber-500/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3.5"><Trophy className="w-3 h-3" /> Challenges</div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Défis <span className="text-amber-500">communautaires</span></h1>
          <p className="text-sm text-muted-foreground max-w-lg">Relevez des défis hebdomadaires pour booster votre networking et gagner des récompenses.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🏆" value={String(challenges.length)} label="Défis actifs" badge="Cette semaine" badgeType="up" />
        <MetricCard icon="🔥" value={String(participations.length)} label="Participations" badge="En cours" badgeType="up" />
        <MetricCard icon="✅" value={String(completedCount)} label="Complétés" badge="Total" badgeType="up" />
        <MetricCard icon="⭐" value={String(completedCount * 100)} label="Points gagnés" badge="Récompenses" badgeType="neutral" />
      </div>

      {/* Active challenges */}
      <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2"><Flame className="w-5 h-5 text-amber-500" /> Défis en cours</h2>
      {challenges.length === 0 ? (
        <GHCard className="text-center py-12 mb-5">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun défi actif pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">Revenez bientôt pour de nouveaux challenges !</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {challenges.map((challenge: any) => {
            const participation = participations.find((p: any) => p.challenge_id === challenge.id);
            const isJoined = myParticipationIds.has(challenge.id);
            const progress = participation ? Math.min(100, Math.round((participation.current_value / challenge.target_value) * 100)) : 0;
            const hoursLeft = differenceInHours(new Date(challenge.ends_at), new Date());
            const daysLeft = differenceInDays(new Date(challenge.ends_at), new Date());

            return (
              <GHCard key={challenge.id} className="relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{challengeIcons[challenge.challenge_type] || "🎯"}</span>
                    <div>
                      <h3 className="font-heading text-sm font-bold">{challenge.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-amber-500">+{challenge.reward_points} pts</div>
                    <div className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {daysLeft > 0 ? `${daysLeft}j` : `${hoursLeft}h`}</div>
                  </div>
                </div>

                {isJoined ? (
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="text-muted-foreground">{participation?.current_value ?? 0} / {challenge.target_value}</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 mb-2" />
                    {participation?.completed && <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold"><CheckCircle className="w-3 h-3" /> Complété !</div>}
                  </div>
                ) : (
                  <button onClick={() => joinChallenge.mutate(challenge.id)} className="w-full bg-amber-500/10 text-amber-600 rounded-lg py-2 text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Relever le défi
                  </button>
                )}
              </GHCard>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      <GHCard>
        <h2 className="font-heading text-sm font-bold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Classement des challengers</h2>
        {leaderboard.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Aucun challenger pour le moment. Soyez le premier !</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry: any, i: number) => (
              <div key={entry.id} className="flex items-center gap-3 py-1.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? "bg-amber-500/20 text-amber-600" : "bg-secondary text-muted-foreground"}`}>{i + 1}</span>
                <div className="flex-1"><span className="text-xs font-medium">{(entry as any).profiles?.display_name ?? "Membre"}</span></div>
                <span className="text-[10px] text-green-500 font-bold">✅</span>
              </div>
            ))}
          </div>
        )}
      </GHCard>
    </motion.div>
  );
}
