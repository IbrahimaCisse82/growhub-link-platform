import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useMatching } from "@/hooks/useMatching";
import { useSendConnection } from "@/hooks/useConnections";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, X, Sparkles, MapPin, Building2, ArrowRight, Heart, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function SmartMatchCards() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: matches, isLoading } = useMatching(15);
  const sendConnection = useSendConnection();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, "connect" | "pass">>({});

  const handleConnect = async (match: any) => {
    try {
      await sendConnection.mutateAsync({ receiverId: match.user_id, matchScore: match.match_score });
      setDecisions(d => ({ ...d, [match.user_id]: "connect" }));
      toast.success(`Demande envoyée à ${match.display_name} !`);
      setCurrentIndex(i => i + 1);
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handlePass = (match: any) => {
    setDecisions(d => ({ ...d, [match.user_id]: "pass" }));
    setCurrentIndex(i => i + 1);
  };

  const remaining = (matches ?? []).filter(m => !decisions[m.user_id]);
  const current = remaining[0];
  const next = remaining[1];
  const connectCount = Object.values(decisions).filter(d => d === "connect").length;

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-base font-bold">Match Express</h2>
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!matches?.length) return null;

  if (!current) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-base font-bold">Match Express</h2>
        </div>
        <GHCard className="text-center py-10">
          <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold mb-2">Session terminée !</h3>
          <p className="text-sm text-muted-foreground mb-1">
            {connectCount} connexion{connectCount !== 1 ? "s" : ""} envoyée{connectCount !== 1 ? "s" : ""}
          </p>
          <button onClick={() => { setDecisions({}); setCurrentIndex(0); }}
            className="mt-4 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold hover:bg-primary-hover transition-all">
            Recommencer
          </button>
        </GHCard>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-base font-bold">Match Express</h2>
          <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{remaining.length} restant{remaining.length > 1 ? "s" : ""}</span>
        </div>
        <button onClick={() => navigate("/networking")} className="text-xs text-primary font-bold hover:opacity-70">Voir tout →</button>
      </div>

      <div className="relative h-[360px]">
        {/* Background card */}
        {next && (
          <div className="absolute inset-x-3 top-3 bottom-0 bg-card border border-border rounded-2xl opacity-60 scale-[0.96]" />
        )}

        {/* Main swipable card */}
        <SwipeCard
          key={current.user_id}
          match={current}
          onConnect={() => handleConnect(current)}
          onPass={() => handlePass(current)}
          onViewProfile={() => navigate(`/profile/${current.user_id}`)}
        />
      </div>
    </div>
  );
}

function SwipeCard({ match, onConnect, onPass, onViewProfile }: {
  match: any;
  onConnect: () => void;
  onPass: () => void;
  onViewProfile: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const connectOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      animate(x, 500, { duration: 0.3 });
      setTimeout(onConnect, 200);
    } else if (info.offset.x < -100) {
      animate(x, -500, { duration: 0.3 });
      setTimeout(onPass, 200);
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  const scoreColor = match.match_score >= 70 ? "text-primary" : match.match_score >= 40 ? "text-ghorange" : "text-muted-foreground";

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="bg-card border-2 border-border rounded-2xl h-full p-6 flex flex-col relative overflow-hidden">
        {/* Swipe indicators */}
        <motion.div style={{ opacity: connectOpacity }}
          className="absolute top-6 right-6 bg-primary/20 border-2 border-primary text-primary rounded-xl px-4 py-2 font-heading text-sm font-bold -rotate-12 z-10">
          CONNECTER ✓
        </motion.div>
        <motion.div style={{ opacity: passOpacity }}
          className="absolute top-6 left-6 bg-destructive/20 border-2 border-destructive text-destructive rounded-xl px-4 py-2 font-heading text-sm font-bold rotate-12 z-10">
          PASSER ✗
        </motion.div>

        {/* Score badge */}
        <div className="absolute top-4 right-4 z-0">
          <div className={cn("font-heading text-2xl font-extrabold", scoreColor)}>{match.match_score}%</div>
          <div className="text-[9px] text-muted-foreground text-right">match</div>
        </div>

        {/* Avatar + Info */}
        <div className="flex items-start gap-4 mb-4">
          {match.avatar_url ? (
            <img src={match.avatar_url} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" alt="" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-lg font-extrabold text-primary-foreground flex-shrink-0">
              {(match.display_name ?? "?").substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-bold truncate">{match.display_name}</h3>
            {match.company_name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3" /> {match.company_name}
              </div>
            )}
            {match.city && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" /> {match.city}
              </div>
            )}
            {match.sector && <Tag variant="blue" className="mt-1">{match.sector}</Tag>}
          </div>
        </div>

        {/* Match reasons */}
        <div className="flex-1 space-y-2 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pourquoi ce match</div>
          {match.match_reasons?.slice(0, 3).map((reason: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {reason}
            </div>
          ))}
        </div>

        {/* Skills */}
        {match.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {match.skills.slice(0, 4).map((s: string) => (
              <span key={s} className="bg-secondary text-foreground/70 rounded-lg px-2 py-0.5 text-[10px] font-medium">{s}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-auto">
          <button onClick={onPass}
            className="flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground rounded-xl py-3 font-heading text-xs font-bold hover:bg-destructive/10 hover:text-destructive transition-all">
            <X className="w-4 h-4" /> Passer
          </button>
          <button onClick={onViewProfile}
            className="flex items-center justify-center bg-secondary text-foreground rounded-xl px-4 py-3 font-heading text-xs font-bold hover:bg-secondary/80 transition-all">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onConnect}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-heading text-xs font-bold hover:bg-primary-hover transition-all">
            <UserPlus className="w-4 h-4" /> Connecter
          </button>
        </div>

        {/* Swipe hint */}
        <div className="text-center text-[9px] text-muted-foreground/50 mt-2">
          ← Glissez pour passer · Glissez pour connecter →
        </div>
      </div>
    </motion.div>
  );
}
