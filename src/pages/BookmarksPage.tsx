import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag } from "@/components/ui-custom";
import { useBookmarks } from "@/components/BookmarkButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Bookmark, Trash2, FileText, Users, ShoppingBag, MessageSquare } from "lucide-react";
import { useToggleBookmark } from "@/components/BookmarkButton";

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  post: { label: "Publication", icon: FileText, color: "text-primary" },
  profile: { label: "Profil", icon: Users, color: "text-ghblue" },
  service: { label: "Service", icon: ShoppingBag, color: "text-ghorange" },
  event: { label: "Événement", icon: MessageSquare, color: "text-ghpurple" },
};

export default function BookmarksPage() {
  usePageMeta({ title: "Favoris", description: "Retrouvez tous vos éléments sauvegardés." });
  const { user } = useAuth();
  const { data: bookmarks, isLoading } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const [filter, setFilter] = useState<string>("all");

  // Fetch related data for bookmarked items
  const { data: postDetails } = useQuery({
    queryKey: ["bookmark-posts", bookmarks],
    enabled: !!bookmarks && bookmarks.some(b => b.item_type === "post"),
    queryFn: async () => {
      const postIds = bookmarks!.filter(b => b.item_type === "post").map(b => b.item_id);
      if (postIds.length === 0) return {};
      const { data } = await supabase.from("posts").select("id, content, author_id, created_at, likes_count").in("id", postIds);
      return Object.fromEntries((data ?? []).map(p => [p.id, p]));
    },
  });

  const { data: profileDetails } = useQuery({
    queryKey: ["bookmark-profiles", bookmarks],
    enabled: !!bookmarks && bookmarks.some(b => b.item_type === "profile"),
    queryFn: async () => {
      const profileIds = bookmarks!.filter(b => b.item_type === "profile").map(b => b.item_id);
      if (profileIds.length === 0) return {};
      const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url, sector").in("user_id", profileIds);
      return Object.fromEntries((data ?? []).map(p => [p.user_id, p]));
    },
  });

  const filtered = filter === "all" ? bookmarks : bookmarks?.filter(b => b.item_type === filter);
  const types = [...new Set(bookmarks?.map(b => b.item_type) ?? [])];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <Bookmark className="w-3.5 h-3.5" /> Favoris
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Vos <span className="text-primary">favoris</span>
          </h1>
          <p className="text-foreground/60 text-sm">{bookmarks?.length ?? 0} élément{(bookmarks?.length ?? 0) > 1 ? "s" : ""} sauvegardé{(bookmarks?.length ?? 0) > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`h-[30px] px-3 rounded-lg text-[11px] font-semibold font-heading border transition-colors ${
            filter === "all" ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"}`}>
          Tous ({bookmarks?.length ?? 0})
        </button>
        {types.map(t => {
          const conf = typeConfig[t] ?? { label: t, icon: Bookmark, color: "text-muted-foreground" };
          const count = bookmarks?.filter(b => b.item_type === t).length ?? 0;
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={`h-[30px] px-3 rounded-lg text-[11px] font-semibold font-heading border transition-colors flex items-center gap-1 ${
                filter === t ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"}`}>
              <conf.icon className="w-3 h-3" /> {conf.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookmarks list */}
      {!filtered || filtered.length === 0 ? (
        <GHCard className="text-center py-12">
          <Bookmark className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun favori pour le moment.</p>
        </GHCard>
      ) : (
        <div className="space-y-2">
          {filtered.map(bm => {
            const conf = typeConfig[bm.item_type] ?? { label: bm.item_type, icon: Bookmark, color: "text-muted-foreground" };
            const Icon = conf.icon;

            let title = `${conf.label} #${bm.item_id.slice(0, 8)}`;
            let subtitle = "";

            if (bm.item_type === "post" && postDetails?.[bm.item_id]) {
              title = postDetails[bm.item_id].content?.slice(0, 80) + "...";
              subtitle = `❤️ ${postDetails[bm.item_id].likes_count ?? 0} likes`;
            }
            if (bm.item_type === "profile" && profileDetails?.[bm.item_id]) {
              title = profileDetails[bm.item_id].display_name;
              subtitle = profileDetails[bm.item_id].sector ?? "";
            }

            return (
              <GHCard key={bm.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${conf.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold truncate">{title}</span>
                    <Tag>{conf.label}</Tag>
                  </div>
                  {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(bm.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                  <button onClick={() => toggleBookmark.mutate({ itemType: bm.item_type, itemId: bm.item_id })}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GHCard>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
