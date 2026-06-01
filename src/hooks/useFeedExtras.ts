import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

/** Trending hashtags from the last 7 days */
export function useTrendingHashtags(limit = 10) {
  return useQuery({
    queryKey: ["trending-hashtags", limit],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      const { data, error } = await supabase
        .from("post_hashtags")
        .select("tag")
        .gte("created_at", since);
      if (error) throw error;
      const counts = new Map<string, number>();
      (data ?? []).forEach((r: any) => counts.set(r.tag, (counts.get(r.tag) ?? 0) + 1));
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
    },
    staleTime: 60_000,
  });
}

/** Report a post — opens a moderation case */
export function useReportPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, reason, details }: { postId: string; reason: string; details?: string }) => {
      if (!user) throw new Error("Non authentifié");
      const { error } = await supabase.from("post_reports").insert({
        post_id: postId,
        reporter_id: user.id,
        reason,
        details: details ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Signalement envoyé. Merci !");
      queryClient.invalidateQueries({ queryKey: ["post-reports"] });
    },
    onError: (e: any) => {
      const msg = String(e?.message ?? "");
      if (msg.includes("duplicate")) toast.info("Vous avez déjà signalé cette publication.");
      else toast.error("Impossible d'envoyer le signalement");
    },
  });
}
