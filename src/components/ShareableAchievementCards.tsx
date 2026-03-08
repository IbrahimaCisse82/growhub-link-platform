import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GHCard, Tag } from "@/components/ui-custom";
import { Share2, Download, Copy, ExternalLink, Trophy, Users, MessageSquare, Calendar, Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  shareText: string;
}

export default function ShareableAchievementCards() {
  const { user, profile } = useAuth();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["shareable-achievements", user?.id],
    enabled: !!user && !!profile,
    queryFn: async (): Promise<Achievement[]> => {
      const [connsRes, postsRes, eventsRes, badgesRes, coachRes, endorseRes] = await Promise.all([
        supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted"),
        supabase.from("posts").select("id, likes_count", { count: "exact" }).eq("author_id", user!.id),
        supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("user_badges").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("learner_id", user!.id).eq("status", "completed"),
        supabase.from("endorsements").select("id", { count: "exact", head: true }).eq("endorsed_id", user!.id),
      ]);

      const connections = connsRes.count ?? 0;
      const posts = postsRes.count ?? 0;
      const totalLikes = (postsRes.data ?? []).reduce((sum, p) => sum + (p.likes_count ?? 0), 0);
      const events = eventsRes.count ?? 0;
      const badges = badgesRes.count ?? 0;
      const coaching = coachRes.count ?? 0;
      const endorsements = endorseRes.count ?? 0;
      const name = profile!.display_name;

      const cards: Achievement[] = [];

      if (connections > 0) cards.push({
        id: "connections",
        type: "network",
        title: "Réseau professionnel",
        subtitle: `${name} sur GrowHubLink`,
        value: `${connections} connexions`,
        icon: <Users className="w-6 h-6" />,
        gradient: "from-primary to-primary/60",
        shareText: `🌐 ${connections} connexions professionnelles sur GrowHubLink ! Mon réseau est ma force. #Networking #GrowHub`,
      });

      if (posts > 0) cards.push({
        id: "content",
        type: "content",
        title: "Créateur de contenu",
        subtitle: `${totalLikes} likes récoltés`,
        value: `${posts} publications`,
        icon: <MessageSquare className="w-6 h-6" />,
        gradient: "from-ghblue to-ghblue/60",
        shareText: `📝 ${posts} posts et ${totalLikes} likes sur GrowHubLink ! Le partage de connaissances, c'est la clé. #ContentCreator #GrowHub`,
      });

      if (events > 0) cards.push({
        id: "events",
        type: "engagement",
        title: "Participant actif",
        subtitle: "Événements & networking",
        value: `${events} événements`,
        icon: <Calendar className="w-6 h-6" />,
        gradient: "from-ghorange to-ghorange/60",
        shareText: `📅 ${events} événements sur GrowHubLink ! Toujours en mouvement, toujours en réseau. #Events #GrowHub`,
      });

      if (badges > 0) cards.push({
        id: "badges",
        type: "achievement",
        title: "Collectionneur",
        subtitle: "Badges d'accomplissement",
        value: `${badges} badges`,
        icon: <Award className="w-6 h-6" />,
        gradient: "from-ghgold to-ghgold/60",
        shareText: `🏆 ${badges} badges débloqués sur GrowHubLink ! Chaque badge raconte une histoire. #Achievement #GrowHub`,
      });

      if (coaching > 0) cards.push({
        id: "coaching",
        type: "growth",
        title: "Apprenant engagé",
        subtitle: "Sessions de coaching",
        value: `${coaching} sessions`,
        icon: <TrendingUp className="w-6 h-6" />,
        gradient: "from-ghpurple to-ghpurple/60",
        shareText: `🎓 ${coaching} sessions de coaching sur GrowHubLink ! L'investissement en soi est le meilleur ROI. #Coaching #GrowHub`,
      });

      if (endorsements > 0) cards.push({
        id: "endorsements",
        type: "trust",
        title: "Professionnel reconnu",
        subtitle: "Recommandations reçues",
        value: `${endorsements} endorsements`,
        icon: <Trophy className="w-6 h-6" />,
        gradient: "from-ghteal to-ghteal/60",
        shareText: `⭐ ${endorsements} recommandations sur GrowHubLink ! La confiance se construit ensemble. #Endorsements #GrowHub`,
      });

      return cards;
    },
    staleTime: 60_000 * 5,
  });

  const shareToLinkedIn = (text: string) => {
    const url = encodeURIComponent("https://growhublink.com");
    const summary = encodeURIComponent(text);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${summary}`, "_blank");
  };

  const shareToX = (text: string) => {
    const encoded = encodeURIComponent(text + "\nhttps://growhublink.com");
    window.open(`https://x.com/intent/tweet?text=${encoded}`, "_blank");
  };

  const copyShareText = (text: string) => {
    navigator.clipboard.writeText(text + "\nhttps://growhublink.com");
    toast.success("Texte copié !");
  };

  if (isLoading || !achievements?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="font-heading text-base font-bold">Vos Achievements partageables</h3>
        <Tag variant="green">Nouveau</Tag>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Partagez vos succès sur les réseaux sociaux et attirez de nouvelles connexions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((a, idx) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <div className="rounded-2xl overflow-hidden border border-border hover:border-primary/25 transition-all group">
              {/* Card visual */}
              <div className={cn("bg-gradient-to-br p-5 text-white relative", a.gradient)}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="mb-4 opacity-80">{a.icon}</div>
                  <div className="font-heading text-2xl font-extrabold mb-0.5">{a.value}</div>
                  <div className="text-sm font-bold opacity-90">{a.title}</div>
                  <div className="text-xs opacity-70">{a.subtitle}</div>
                </div>
                <div className="absolute bottom-2 right-3 text-[9px] font-bold opacity-40">growhublink.com</div>
              </div>

              {/* Share actions */}
              <div className="bg-card p-3 flex items-center gap-2">
                <button
                  onClick={() => shareToLinkedIn(a.shareText)}
                  className="flex-1 bg-[#0077B5]/10 text-[#0077B5] rounded-lg py-2 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-[#0077B5]/20 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> LinkedIn
                </button>
                <button
                  onClick={() => shareToX(a.shareText)}
                  className="flex-1 bg-foreground/5 text-foreground rounded-lg py-2 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-foreground/10 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> X
                </button>
                <button
                  onClick={() => copyShareText(a.shareText)}
                  className="bg-secondary rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copier le texte"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
