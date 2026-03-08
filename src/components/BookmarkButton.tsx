import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function useBookmarks(itemType?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookmarks", user?.id, itemType],
    enabled: !!user,
    queryFn: async () => {
      let query = (supabase as any).from("bookmarks").select("*").eq("user_id", user!.id);
      if (itemType) query = query.eq("item_type", itemType);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as { id: string; user_id: string; item_type: string; item_id: string; note: string | null; created_at: string }[];
    },
  });
}

export function useToggleBookmark() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      // Check if already bookmarked
      const { data: existing } = await (supabase as any)
        .from("bookmarks")
        .select("id")
        .eq("user_id", user!.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase as any).from("bookmarks").delete().eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await (supabase as any).from("bookmarks").insert({
          user_id: user!.id,
          item_type: itemType,
          item_id: itemId,
        });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success(result.action === "added" ? "Ajouté aux favoris ⭐" : "Retiré des favoris");
    },
    onError: () => toast.error("Erreur"),
  });
}

interface BookmarkButtonProps {
  itemType: string;
  itemId: string;
  className?: string;
  size?: "sm" | "md";
}

export default function BookmarkButton({ itemType, itemId, className, size = "sm" }: BookmarkButtonProps) {
  const { data: bookmarks } = useBookmarks();
  const toggle = useToggleBookmark();

  const isBookmarked = bookmarks?.some(b => b.item_type === itemType && b.item_id === itemId);
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle.mutate({ itemType, itemId }); }}
      disabled={toggle.isPending}
      className={cn(
        "p-1 rounded-md transition-colors",
        isBookmarked ? "text-primary" : "text-muted-foreground/40 hover:text-primary/70",
        className
      )}
      title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {isBookmarked ? <BookmarkCheck className={iconSize} /> : <Bookmark className={iconSize} />}
    </button>
  );
}
