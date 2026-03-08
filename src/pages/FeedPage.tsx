import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useInfinitePosts, useToggleReaction, useUserReactions, useComments, useAddComment, useDeletePost } from "@/hooks/useFeed";
import { useUserReposts, useRepost, useUndoRepost } from "@/hooks/useReposts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageCircle, Share2, Send, Trash2, Image, X, Reply, Loader2, Repeat2, TrendingUp, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";

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

// ─── Nested Comments Component ─────────────────────────
function CommentThread({ comments, postId, user }: { comments: any[]; postId: string; user: any }) {
  const addComment = useAddComment();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Build tree from flat list
  const rootComments = comments.filter(c => !c.parent_id);
  const childMap = new Map<string, any[]>();
  comments.forEach(c => {
    if (c.parent_id) {
      if (!childMap.has(c.parent_id)) childMap.set(c.parent_id, []);
      childMap.get(c.parent_id)!.push(c);
    }
  });

  const handleReply = (parentId: string) => {
    if (!replyText.trim()) return;
    addComment.mutate({ postId, content: replyText.trim(), parentId }, {
      onSuccess: () => { setReplyText(""); setReplyingTo(null); },
    });
  };

  const renderComment = (c: any, depth: number) => (
    <div key={c.id} className={cn("flex gap-2 items-start", depth > 0 && "ml-6 border-l-2 border-border/30 pl-3")}>
      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold flex-shrink-0">
        {(c.author?.display_name ?? "?").substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-secondary/50 rounded-lg px-3 py-2 text-xs">
          <span className="font-bold">{c.author?.display_name ?? "Membre"}</span>
          <span className="text-muted-foreground ml-2 text-[10px]">
            {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
          <p className="mt-1 text-foreground/80">{c.content}</p>
        </div>
        {depth < 2 && (
          <button
            onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
            className="text-[10px] text-muted-foreground hover:text-primary mt-1 flex items-center gap-1"
          >
            <Reply className="w-3 h-3" /> Répondre
          </button>
        )}
        {replyingTo === c.id && (
          <div className="flex gap-2 mt-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReply(c.id)}
              placeholder="Votre réponse..."
              className="flex-1 bg-secondary/50 rounded-lg px-3 py-1.5 text-xs outline-none border border-border focus:border-primary/40"
              autoFocus
            />
            <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()} className="bg-primary text-primary-foreground rounded-lg px-2 py-1.5 disabled:opacity-50">
              <Send className="w-3 h-3" />
            </button>
          </div>
        )}
        {/* Render children */}
        {childMap.has(c.id) && (
          <div className="space-y-2 mt-2">
            {childMap.get(c.id)!.map(child => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {rootComments.map(c => renderComment(c, 0))}
    </div>
  );
}

// ─── Hashtag renderer ───────────────────────────────────
function HashtagText({ text, onTagClick }: { text: string; onTagClick: (tag: string) => void }) {
  const parts = text.split(/(#\w+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("#") ? (
          <button key={i} onClick={() => onTagClick(part.slice(1))} className="text-primary font-medium hover:underline">
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

type SortMode = "recent" | "trending" | "relevant";

// ─── Main Feed Page ─────────────────────────────────────
export default function FeedPage() {
  usePageMeta({ title: "Fil d'actualité", description: "Suivez les actualités de la communauté startup GrowHub." });
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePosts();
  const { data: userReactions } = useUserReactions();
  const { data: userRepostIds } = useUserReposts();
  const repost = useRepost();
  const undoRepost = useUndoRepost();
  const toggleReaction = useToggleReaction();
  const deletePost = useDeletePost();
  const addComment = useAddComment();

  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<string>("text");
  const [posting, setPosting] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const { data: comments } = useComments(commentingPostId);

  // Image upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPostsRaw = data?.pages.flatMap(p => p.posts) ?? [];

  // Sort posts
  const allPosts = [...allPostsRaw].sort((a, b) => {
    if (sortMode === "trending") {
      const scoreA = (a.likes_count ?? 0) * 3 + (a.comments_count ?? 0) * 5 + (a.shares_count ?? 0) * 8;
      const scoreB = (b.likes_count ?? 0) * 3 + (b.comments_count ?? 0) * 5 + (b.shares_count ?? 0) * 8;
      return scoreB - scoreA;
    }
    // "recent" is default sort from API
    return 0;
  }).filter(p => {
    if (!hashtagFilter) return true;
    return p.tags?.includes(hashtagFilter) || p.content.toLowerCase().includes(`#${hashtagFilter.toLowerCase()}`);
  });

  const handleTagClick = (tag: string) => {
    setHashtagFilter(hashtagFilter === tag ? null : tag);
  };

  const handleRepost = (postId: string) => {
    if (userRepostIds?.includes(postId)) {
      undoRepost.mutate(postId, { onSuccess: () => toast.success("Repost annulé") });
    } else {
      repost.mutate({ postId }, { onSuccess: () => toast.success("Reposté !") });
    }
  };
  const isReposted = (postId: string) => userRepostIds?.includes(postId) ?? false;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + selectedImages.length > 4) {
      toast.error("Maximum 4 images par post");
      return;
    }
    const validFiles = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} est trop lourd (max 10MB)`); return false; }
      return true;
    });
    setSelectedImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0 || !user) return [];
    const urls: string[] = [];
    for (const file of selectedImages) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("post-media").upload(path, file);
      if (error) { toast.error("Erreur d'upload"); continue; }
      const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    setUploadingImages(selectedImages.length > 0);

    let mediaUrls: string[] = [];
    if (selectedImages.length > 0) {
      mediaUrls = await uploadImages();
    }

    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: newPost.trim(),
      post_type: postType as any,
      media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
    });
    setPosting(false);
    setUploadingImages(false);
    if (error) {
      toast.error("Erreur lors de la publication");
    } else {
      toast.success("Publié !");
      setNewPost("");
      setPostType("text");
      setSelectedImages([]);
      setImagePreviews([]);
      queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  };

  const handleLike = (postId: string) => toggleReaction.mutate({ postId });
  const handleDelete = (postId: string) => deletePost.mutate(postId, {
    onSuccess: () => toast.success("Post supprimé"),
    onError: () => toast.error("Erreur"),
  });
  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    addComment.mutate({ postId, content: commentText.trim() }, {
      onSuccess: () => { setCommentText(""); toast.success("Commentaire ajouté"); },
    });
  };
  const isLiked = (postId: string) => userReactions?.some(r => r.post_id === postId);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Fil d'actualité
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            L'<span className="text-primary">écosystème</span> en direct
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Partagez, réagissez, commentez — chaque action est visible par tout votre réseau.
          </p>
        </div>
      </div>

      {/* New post with image upload */}
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

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1.5 items-center flex-wrap">
                {Object.entries(postTypeLabels).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPostType(key)}
                    className={cn(
                      "text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors",
                      postType === key
                        ? "bg-primary/10 border-primary/35 text-primary"
                        : "bg-card border-border text-foreground/50 hover:text-foreground/80"
                    )}
                  >
                    {val.label}
                  </button>
                ))}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-border text-foreground/50 hover:text-primary hover:border-primary/35 transition-colors flex items-center gap-1"
                >
                  <Image className="w-3 h-3" /> Photo
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || posting}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 hover:bg-primary-hover transition-colors"
              >
                {uploadingImages ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publier
              </button>
            </div>
          </div>
        </div>
      </GHCard>

      {/* Sort tabs & hashtag filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
          {([
            { key: "recent" as SortMode, icon: Clock, label: "Récent" },
            { key: "trending" as SortMode, icon: TrendingUp, label: "Tendances" },
          ]).map(s => (
            <button key={s.key} onClick={() => setSortMode(s.key)}
              className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                sortMode === s.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <s.icon className="w-3 h-3" /> {s.label}
            </button>
          ))}
        </div>
        {hashtagFilter && (
          <button onClick={() => setHashtagFilter(null)} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg">
            #{hashtagFilter} <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Posts list with infinite scroll */}
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl mb-3" />)
      ) : allPosts.length === 0 ? (
        <GHCard className="text-center py-8">
          <p className="text-sm text-muted-foreground">Aucune publication pour le moment. Soyez le premier à publier !</p>
        </GHCard>
      ) : (
        <>
          {allPosts.map((post, idx) => {
            const typeInfo = postTypeLabels[post.post_type] || postTypeLabels.text;
            const liked = isLiked(post.id);
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
                  {post.author_id === user?.id && (
                    <button onClick={() => handleDelete(post.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed mb-3 whitespace-pre-line">
                  <HashtagText text={post.content} onTagClick={handleTagClick} />
                </p>

                {/* Media gallery */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className={cn(
                    "grid gap-2 mb-3 rounded-xl overflow-hidden",
                    post.media_urls.length === 1 && "grid-cols-1",
                    post.media_urls.length === 2 && "grid-cols-2",
                    post.media_urls.length >= 3 && "grid-cols-2"
                  )}>
                    {post.media_urls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className={cn(
                          "w-full object-cover rounded-lg border border-border",
                          post.media_urls!.length === 1 ? "max-h-[400px]" : "h-48"
                        )}
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag) => (
                      <button key={tag} onClick={() => handleTagClick(tag)} className="text-[10px] text-primary font-medium bg-primary/10 rounded-full px-2 py-0.5 hover:bg-primary/20 transition-colors">#{tag}</button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      liked ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Heart className={cn("w-3.5 h-3.5", liked && "fill-primary")} /> {post.likes_count ?? 0}
                  </button>
                  <button
                    onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> {post.comments_count ?? 0}
                  </button>
                  <div className="relative group">
                    <button
                      onClick={() => { navigator.clipboard.writeText(window.location.origin + "/feed"); toast.success("Lien copié !"); }}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Partager
                    </button>
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex gap-1 bg-card border border-border rounded-lg p-1.5 shadow-lg z-10">
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/feed")}&summary=${encodeURIComponent(post.content.substring(0, 200))}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-muted transition-colors"
                      >LinkedIn</a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content.substring(0, 200))}&url=${encodeURIComponent(window.location.origin)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-muted transition-colors"
                      >X/Twitter</a>
                    </div>
                  </div>
                </div>

                {/* Nested Comments */}
                {commentingPostId === post.id && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    {comments && comments.length > 0 && (
                      <div className="mb-3">
                        <CommentThread comments={comments} postId={post.id} user={user} />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                        placeholder="Écrire un commentaire..."
                        className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-xs outline-none border border-border focus:border-primary/40"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!commentText.trim()}
                        className="bg-primary text-primary-foreground rounded-lg px-3 py-2 disabled:opacity-50 hover:bg-primary-hover transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </GHCard>
            );
          })}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : hasNextPage ? (
              <span className="text-xs text-muted-foreground">Scroll pour charger plus...</span>
            ) : allPosts.length > 0 ? (
              <span className="text-xs text-muted-foreground">Fin du fil d'actualité</span>
            ) : null}
          </div>
        </>
      )}
    </motion.div>
  );
}
