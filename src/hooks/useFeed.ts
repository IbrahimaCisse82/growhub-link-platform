import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

const PAGE_SIZE = 15;

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts-infinite"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      if (!data || data.length === 0) return { posts: [], nextPage: undefined };

      const authorIds = [...new Set(data.map(p => p.author_id))];
      const profiles = await fetchProfilesByUserIds(authorIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      const posts = data.map(p => ({ ...p, author: profileMap[p.author_id] ?? null }));
      return {
        posts,
        nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

// Keep simple usePosts for dashboard widget
export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const authorIds = [...new Set(data.map(p => p.author_id))];
      const profiles = await fetchProfilesByUserIds(authorIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(p => ({ ...p, author: profileMap[p.author_id] ?? null }));
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, emoji }: { postId: string; emoji?: string }) => {
      const { data: existing } = await supabase
        .from("post_reactions")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        await supabase.from("post_reactions").delete().eq("id", existing.id);
        await supabase.rpc("decrement_post_likes", { post_id: postId });
      } else {
        await supabase.from("post_reactions").insert({ post_id: postId, user_id: user!.id, emoji: emoji || "👍" });
        await supabase.rpc("increment_post_likes", { post_id: postId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["post-reactions"] });
    },
  });
}

export function useUserReactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["post-reactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("post_reactions")
        .select("post_id, emoji")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });
}

export function useComments(postId: string | null) {
  return useQuery({
    queryKey: ["comments", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const authorIds = [...new Set(data.map(c => c.author_id))];
      const profiles = await fetchProfilesByUserIds(authorIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => ({ ...c, author: profileMap[c.author_id] ?? null }));
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: user!.id,
        content,
        parent_id: parentId ?? null,
      });
      if (error) throw error;
      await supabase.rpc("increment_post_comments", { post_id: postId });
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
    },
  });
}
