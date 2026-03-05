import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag, SectionHeader } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";

const postTypeLabels: Record<string, { label: string; color: string }> = {
  text: { label: "Publication", color: "default" },
  milestone: { label: "🎯 Milestone", color: "green" },
  question: { label: "❓ Question", color: "blue" },
  resource: { label: "📚 Ressource", color: "purple" },
  announcement: { label: "📢 Annonce", color: "orange" },
};

const gradients = [
  "from-[#200a30] to-[#A064FF]",
  "from-[#103050] to-[#4096FF]",
  "from-[#1a3a10] to-[#5CBF00]",
  "from-[#301a08] to-[#D06020]",
  "from-[#0a3040] to-[#00B8A0]",
];

export default function FeedPage() {
  const { user } = useAuth();
  const { data: posts, isLoading, refetch } = usePosts();
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: newPost.trim(),
      post_type: "text",
    });
    setPosting(false);
    if (error) {
      toast.error("Erreur lors de la publication");
    } else {
      toast.success("Publié !");
      setNewPost("");
      refetch();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Fil d'actualité
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            L'<span className="text-primary">écosystème</span> en direct
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Partagez, réagissez, commentez — chaque action est visible par tout votre réseau.
          </p>
        </div>
      </div>

      {/* New post */}
      <GHCard className="mb-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center font-heading text-xs font-extrabold text-primary-foreground flex-shrink-0">
            {user?.email?.substring(0, 2).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Partagez une actualité, une question, un milestone..."
              className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:border-primary/40 transition-colors"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || posting}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 hover:bg-primary-hover transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Publier
              </button>
            </div>
          </div>
        </div>
      </GHCard>

      {/* Posts list */}
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl mb-3" />)
      ) : !posts || posts.length === 0 ? (
        <GHCard className="text-center py-8">
          <p className="text-sm text-muted-foreground">Aucune publication pour le moment. Soyez le premier à publier !</p>
        </GHCard>
      ) : (
        posts.map((post, idx) => {
          const typeInfo = postTypeLabels[post.post_type] || postTypeLabels.text;
          return (
            <GHCard key={post.id} className="mb-3">
              <div className="flex gap-3 items-start mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-heading text-xs font-extrabold text-white flex-shrink-0`}>
                  {((post as any).author?.display_name ?? "?").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold">{(post as any).author?.display_name ?? "Utilisateur"}</span>
                    <Tag variant={typeInfo.color as any}>{typeInfo.label}</Tag>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {(post as any).author?.company_name && <span>{(post as any).author.company_name} · </span>}
                    {new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3 whitespace-pre-line">{post.content}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-primary font-medium bg-primary/10 rounded-full px-2 py-0.5">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Heart className="w-3.5 h-3.5" /> {post.likes_count ?? 0}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> {post.comments_count ?? 0}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Partager
                </button>
              </div>
            </GHCard>
          );
        })
      )}
    </motion.div>
  );
}
