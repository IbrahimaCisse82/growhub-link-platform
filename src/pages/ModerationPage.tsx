import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, Eye, Flag, Ban, MessageSquare, Clock } from "lucide-react";

// Simple keyword-based moderation (client-side preview)
const flaggedKeywords = ["spam", "scam", "arnaque", "faux", "fake", "insulte", "menace"];

function analyzeContent(content: string): { score: number; flags: string[] } {
  const lower = content.toLowerCase();
  const flags: string[] = [];
  let score = 0;

  flaggedKeywords.forEach(kw => {
    if (lower.includes(kw)) {
      flags.push(kw);
      score += 25;
    }
  });

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g)?.length ?? 0) / Math.max(content.length, 1);
  if (capsRatio > 0.6 && content.length > 10) {
    flags.push("MAJUSCULES EXCESSIVES");
    score += 15;
  }

  // Check for repeated characters
  if (/(.)\1{5,}/.test(content)) {
    flags.push("Caractères répétés");
    score += 10;
  }

  // URL spam
  const urlCount = (content.match(/https?:\/\//g) ?? []).length;
  if (urlCount > 3) {
    flags.push("Liens multiples");
    score += 20;
  }

  return { score: Math.min(100, score), flags };
}

export default function ModerationPage() {
  usePageMeta({ title: "Modération", description: "Modération IA de la communauté GrowHub." });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "flagged" | "clean">("all");

  const { data: recentPosts = [] } = useQuery({
    queryKey: ["moderation-posts"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*, profiles:author_id(display_name, avatar_url)").order("created_at", { ascending: false }).limit(50);
      return (data ?? []).map((post: any) => ({
        ...post,
        moderation: analyzeContent(post.content),
      }));
    },
  });

  const { data: recentComments = [] } = useQuery({
    queryKey: ["moderation-comments"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("comments").select("*, profiles:author_id(display_name)").order("created_at", { ascending: false }).limit(50);
      return (data ?? []).map((comment: any) => ({
        ...comment,
        moderation: analyzeContent(comment.content),
      }));
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["moderation-posts"] }); toast.success("Post supprimé"); },
  });

  const flaggedPosts = recentPosts.filter((p: any) => p.moderation.score > 0);
  const cleanPosts = recentPosts.filter((p: any) => p.moderation.score === 0);
  const flaggedComments = recentComments.filter((c: any) => c.moderation.score > 0);

  const displayPosts = filter === "flagged" ? flaggedPosts : filter === "clean" ? cleanPosts : recentPosts;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-br from-card to-destructive/5 border-2 border-destructive/15 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-destructive uppercase tracking-wider mb-3.5"><Shield className="w-3 h-3" /> Modération IA</div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Modération <span className="text-destructive">communautaire</span></h1>
          <p className="text-sm text-muted-foreground max-w-lg">Surveillance automatique du contenu avec détection IA des comportements inappropriés.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="📝" value={String(recentPosts.length)} label="Posts analysés" badge="Récents" badgeType="neutral" />
        <MetricCard icon="⚠️" value={String(flaggedPosts.length)} label="Posts signalés" badge="À vérifier" badgeType={flaggedPosts.length > 0 ? "down" : "neutral"} />
        <MetricCard icon="💬" value={String(recentComments.length)} label="Commentaires" badge="Analysés" badgeType="neutral" />
        <MetricCard icon="🛡️" value={String(flaggedComments.length)} label="Commentaires flaggés" badge="IA" badgeType={flaggedComments.length > 0 ? "down" : "neutral"} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "all" as const, label: "Tous", icon: Eye },
          { key: "flagged" as const, label: `Signalés (${flaggedPosts.length})`, icon: AlertTriangle },
          { key: "clean" as const, label: "Conformes", icon: CheckCircle },
        ]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground/70 hover:border-primary/35"}`}>
            <f.icon className="w-3.5 h-3.5" /> {f.label}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        {displayPosts.map((post: any) => (
          <GHCard key={post.id} className={post.moderation.score > 50 ? "border-destructive/30" : post.moderation.score > 0 ? "border-amber-500/30" : ""}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold">{(post as any).profiles?.display_name ?? "Membre"}</span>
                  <span className="text-[9px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString("fr")}</span>
                  {post.moderation.score > 50 && <span className="px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-[9px] font-bold flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Haut risque</span>}
                  {post.moderation.score > 0 && post.moderation.score <= 50 && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded text-[9px] font-bold flex items-center gap-0.5"><Flag className="w-2.5 h-2.5" /> Attention</span>}
                  {post.moderation.score === 0 && <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded text-[9px] font-bold flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> OK</span>}
                </div>
                <p className="text-xs text-foreground/80 line-clamp-3 mb-2">{post.content}</p>
                {post.moderation.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.moderation.flags.map((flag: string) => (
                      <span key={flag} className="px-1.5 py-0.5 bg-destructive/5 text-destructive/70 rounded text-[8px] font-medium">{flag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${post.moderation.score > 50 ? "bg-destructive/10 text-destructive" : post.moderation.score > 0 ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"}`}>
                  {post.moderation.score}
                </div>
                {post.moderation.score > 0 && post.author_id === user?.id && (
                  <button onClick={() => deletePost.mutate(post.id)} className="text-[9px] text-destructive font-bold flex items-center gap-0.5"><Ban className="w-2.5 h-2.5" /></button>
                )}
              </div>
            </div>
          </GHCard>
        ))}
        {displayPosts.length === 0 && (
          <GHCard className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-green-500/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun contenu à afficher</p>
          </GHCard>
        )}
      </div>
    </motion.div>
  );
}
