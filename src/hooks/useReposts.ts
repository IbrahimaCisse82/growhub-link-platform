import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useRepost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, comment }: { postId: string; comment?: string }) => {
      const { error } = await supabase.from("reposts" as any).insert({
        user_id: user!.id,
        original_post_id: postId,
        comment: comment || null,
      });
      if (error) throw error;
      // Increment shares count
      await supabase.from("posts").update({ shares_count: supabase.rpc as any }).eq("id", postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["user-reposts"] });
    },
  });
}

export function useUserReposts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-reposts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("reposts" as any).select("original_post_id").eq("user_id", user!.id);
      return (data ?? []).map((r: any) => r.original_post_id);
    },
  });
}

export function useUndoRepost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("reposts" as any).delete().eq("user_id", user!.id).eq("original_post_id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["user-reposts"] });
    },
  });
}
