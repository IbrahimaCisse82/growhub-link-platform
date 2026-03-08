import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export function useStreaks() {
  const { user } = useAuth();

  // Update streak on mount (once per session)
  useEffect(() => {
    if (!user) return;
    supabase.rpc("update_login_streak", { _user_id: user.id }).then(() => {});
  }, [user]);

  return useQuery({
    queryKey: ["streak", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("login_streak, longest_streak, last_login_date")
        .eq("user_id", user!.id)
        .single();
      return data ?? { login_streak: 0, longest_streak: 0, last_login_date: null };
    },
  });
}

export function useLeaderboard(limit = 10) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["leaderboard", limit],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, company_name, network_score, login_streak, is_verified")
        .eq("is_public", true)
        .order("network_score", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}
