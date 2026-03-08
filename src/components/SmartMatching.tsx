import { useMatching } from "@/hooks/useMatching";
import { GHCard, Tag } from "@/components/ui-custom";
import { useNavigate } from "react-router-dom";
import { useSendConnection } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sparkles, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function SmartMatching() {
  const { data: matches, isLoading } = useMatching(6);
  const navigate = useNavigate();
  const sendConnection = useSendConnection();

  if (isLoading) {
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-base font-extrabold">Recommandations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) return null;

  const handleConnect = async (userId: string, score: number) => {
    try {
      await sendConnection.mutateAsync({ receiverId: userId, matchScore: score });
      toast.success("Demande envoyée !");
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-heading text-base font-extrabold">🎯 Matching intelligent</h3>
        <span className="text-[10px] text-muted-foreground ml-1">Profils complémentaires au vôtre</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {matches.slice(0, 6).map((match, i) => (
          <motion.div key={match.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GHCard className="h-full flex flex-col">
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-extrabold text-primary-foreground flex-shrink-0 overflow-hidden">
                  {match.avatar_url ? (
                    <img src={match.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    match.display_name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading text-xs font-extrabold truncate">{match.display_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{match.company_name ?? match.sector ?? ""}</div>
                </div>
                <div className="bg-primary/10 text-primary font-heading text-xs font-extrabold px-2 py-1 rounded-full flex-shrink-0">
                  {match.match_score}%
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {match.match_reasons.slice(0, 3).map((r, j) => (
                  <Tag key={j} variant="green">{r}</Tag>
                ))}
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => navigate(`/profile/${match.user_id}`)} className="flex-1 text-[11px] font-bold text-foreground/70 bg-secondary rounded-lg py-2 hover:bg-secondary/80 transition-all text-center">
                  Voir profil
                </button>
                <button onClick={() => handleConnect(match.user_id, match.match_score)} className="flex items-center gap-1 text-[11px] font-bold text-primary-foreground bg-primary rounded-lg px-3 py-2 hover:bg-primary/90 transition-all">
                  <UserPlus className="w-3.5 h-3.5" /> Connecter
                </button>
              </div>
            </GHCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
