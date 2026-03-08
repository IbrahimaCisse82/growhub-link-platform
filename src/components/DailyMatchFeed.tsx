import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GHCard, Tag } from "@/components/ui-custom";
import { Flame, Clock, UserPlus, X, Sparkles, ArrowRight } from "lucide-react";
import { useSendConnection } from "@/hooks/useConnections";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

function getTimeRemaining(): string {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = endOfDay.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}min`;
}

function computeMatchScore(profile: any, myProfile: any): number {
  let score = 0;
  const mySkills = new Set((myProfile?.skills ?? []).map((s: string) => s.toLowerCase()));
  const myInterests = new Set((myProfile?.interests ?? []).map((s: string) => s.toLowerCase()));
  const myLookingFor = new Set((myProfile?.looking_for ?? []).map((s: string) => s.toLowerCase()));
  const theirOffering = new Set((profile?.offering ?? []).map((s: string) => s.toLowerCase()));
  const theirSkills = new Set((profile?.skills ?? []).map((s: string) => s.toLowerCase()));
  const theirInterests = new Set((profile?.interests ?? []).map((s: string) => s.toLowerCase()));

  // Skill overlap
  mySkills.forEach(s => { if (theirSkills.has(s)) score += 8; });
  // Interest overlap
  myInterests.forEach(s => { if (theirInterests.has(s)) score += 6; });
  // Looking for ↔ offering match
  myLookingFor.forEach(s => { if (theirOffering.has(s)) score += 15; });
  // Same sector bonus
  if (profile.sector && myProfile.sector && profile.sector.toLowerCase() === myProfile.sector.toLowerCase()) score += 10;
  // Same city bonus
  if (profile.city && myProfile.city && profile.city.toLowerCase() === myProfile.city.toLowerCase()) score += 5;
  // Has bio bonus
  if (profile.bio && profile.bio.length > 20) score += 3;

  return Math.min(99, Math.max(20, score));
}

function getMatchReasons(profile: any, myProfile: any): string[] {
  const reasons: string[] = [];
  const mySkills = new Set((myProfile?.skills ?? []).map((s: string) => s.toLowerCase()));
  const theirSkills = (profile?.skills ?? []);
  const commonSkills = theirSkills.filter((s: string) => mySkills.has(s.toLowerCase()));
  if (commonSkills.length > 0) reasons.push(`${commonSkills.length} compétence${commonSkills.length > 1 ? "s" : ""} en commun`);

  const myLookingFor = new Set((myProfile?.looking_for ?? []).map((s: string) => s.toLowerCase()));
  const theirOffering = (profile?.offering ?? []);
  const matchedOfferings = theirOffering.filter((s: string) => myLookingFor.has(s.toLowerCase()));
  if (matchedOfferings.length > 0) reasons.push(`Propose ce que vous cherchez`);

  if (profile.sector && myProfile.sector && profile.sector.toLowerCase() === myProfile.sector.toLowerCase())
    reasons.push(`Même secteur : ${profile.sector}`);
  if (profile.city && myProfile.city && profile.city.toLowerCase() === myProfile.city.toLowerCase())
    reasons.push(`Même ville : ${profile.city}`);

  if (reasons.length === 0) reasons.push("Profil complémentaire");
  return reasons.slice(0, 3);
}

const gradients = [
  "from-primary/80 to-primary",
  "from-ghblue/80 to-ghblue",
  "from-ghpurple/80 to-ghpurple",
];

export default function DailyMatchFeed() {
  const { user, profile: myProfile } = useAuth();
  const navigate = useNavigate();
  const sendConnection = useSendConnection();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const { data: dailyMatches, isLoading } = useQuery({
    queryKey: ["daily-matches", user?.id, new Date().toDateString()],
    enabled: !!user && !!myProfile,
    queryFn: async () => {
      // Get existing connections to exclude
      const { data: conns } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);

      const connectedIds = new Set(
        (conns ?? []).map(c => c.requester_id === user!.id ? c.receiver_id : c.requester_id)
      );

      // Get all public profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user!.id)
        .eq("is_public", true)
        .limit(50);

      // Filter out already connected & score them
      const candidates = (profiles ?? [])
        .filter(p => !connectedIds.has(p.user_id))
        .map(p => ({
          ...p,
          matchScore: computeMatchScore(p, myProfile),
          reasons: getMatchReasons(p, myProfile),
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      return candidates;
    },
    staleTime: 60_000 * 30,
  });

  const handleConnect = (profileUserId: string, score: number) => {
    sendConnection.mutate(
      { receiverId: profileUserId, matchScore: score },
      {
        onSuccess: () => {
          toast.success("Demande envoyée !");
          setConnected(s => new Set(s).add(profileUserId));
        },
      }
    );
  };

  const visible = (dailyMatches ?? []).filter(m => !dismissed.has(m.user_id));

  if (isLoading || !visible.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-ghorange" />
          <h2 className="font-heading text-base font-bold">Matchs du jour</h2>
          <Tag variant="orange">3 profils</Tag>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Expire dans {getTimeRemaining()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AnimatePresence>
          {visible.map((match, idx) => (
            <motion.div
              key={match.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="bg-card border-2 border-ghorange/20 rounded-2xl overflow-hidden relative group hover:border-ghorange/40 transition-all">
                {/* Gradient header */}
                <div className={cn("h-16 bg-gradient-to-r relative", gradients[idx % gradients.length])}>
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-ghorange" />
                    {match.matchScore}% match
                  </div>
                  <button
                    onClick={() => setDismissed(s => new Set(s).add(match.user_id))}
                    className="absolute top-2 left-2 text-white/60 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Avatar */}
                <div className="flex justify-center -mt-7 relative z-10">
                  {match.avatar_url ? (
                    <img src={match.avatar_url} className="w-14 h-14 rounded-full border-3 border-card object-cover" alt="" />
                  ) : (
                    <div className={cn("w-14 h-14 rounded-full border-3 border-card bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white", gradients[idx % gradients.length])}>
                      {match.display_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="p-4 pt-2 text-center">
                  <h3
                    className="font-heading text-sm font-bold truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/profile/${match.user_id}`)}
                  >
                    {match.display_name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate mb-3">
                    {match.company_name ?? ""}{match.sector ? ` · ${match.sector}` : ""}
                  </p>

                  {/* Match reasons */}
                  <div className="space-y-1 mb-3">
                    {match.reasons.map((reason: string, i: number) => (
                      <div key={i} className="text-[10px] text-muted-foreground bg-secondary rounded-lg px-2 py-1">
                        ✓ {reason}
                      </div>
                    ))}
                  </div>

                  {connected.has(match.user_id) ? (
                    <div className="text-xs font-bold text-primary flex items-center justify-center gap-1">
                      ✓ Demande envoyée
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConnect(match.user_id, match.matchScore)}
                        className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Connecter
                      </button>
                      <button
                        onClick={() => navigate(`/profile/${match.user_id}`)}
                        className="bg-secondary rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
