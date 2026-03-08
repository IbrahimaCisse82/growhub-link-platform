import { useMatching } from "@/hooks/useMatching";
import { useSendConnection } from "@/hooks/useConnections";
import { useNavigate } from "react-router-dom";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, UserPlus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SuggestedProfiles() {
  const { data: matches, isLoading } = useMatching(3);
  const sendConnection = useSendConnection();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-sm font-extrabold">Profils suggérés cette semaine</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
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
      toast.error("Erreur ou déjà connecté");
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="font-heading text-sm font-extrabold">Personnes à connaître</h3>
        </div>
        <button onClick={() => navigate("/networking")} className="text-xs text-primary font-semibold flex items-center gap-1 hover:opacity-70">
          Voir tout <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {matches.slice(0, 3).map((m, i) => (
          <motion.div key={m.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GHCard className="relative">
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">{m.match_score}%</span>
              </div>
              <div className="flex gap-3 items-start mb-2">
                {m.avatar_url ? (
                  <img src={m.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                    {m.display_name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-heading text-sm font-bold truncate cursor-pointer hover:text-primary" onClick={() => navigate(`/profile/${m.user_id}`)}>
                    {m.display_name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{m.company_name ?? ""}{m.sector ? ` · ${m.sector}` : ""}</div>
                </div>
              </div>
              {m.match_reasons.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {m.match_reasons.slice(0, 2).map(r => <Tag key={r} variant="green">{r}</Tag>)}
                </div>
              )}
              <button
                onClick={() => handleConnect(m.user_id, m.match_score)}
                className="w-full bg-primary/10 text-primary rounded-lg py-1.5 text-xs font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3 h-3" /> Connecter
              </button>
            </GHCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
