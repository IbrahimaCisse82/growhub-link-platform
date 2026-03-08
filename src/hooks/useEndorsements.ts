import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useEndorsements(userId: string | undefined) {
  return useQuery({
    queryKey: ["endorsements", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("endorsements")
        .select("*")
        .eq("endorsed_id", userId!);
      if (error) throw error;
      // Group by skill
      const bySkill: Record<string, { count: number; endorserIds: string[] }> = {};
      (data ?? []).forEach(e => {
        if (!bySkill[e.skill]) bySkill[e.skill] = { count: 0, endorserIds: [] };
        bySkill[e.skill].count++;
        bySkill[e.skill].endorserIds.push(e.endorser_id);
      });
      return bySkill;
    },
  });
}

export function useToggleEndorsement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ endorsedId, skill }: { endorsedId: string; skill: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("endorsements")
        .select("id")
        .eq("endorser_id", user.id)
        .eq("endorsed_id", endorsedId)
        .eq("skill", skill)
        .maybeSingle();
      if (existing) {
        await supabase.from("endorsements").delete().eq("id", existing.id);
      } else {
        await supabase.from("endorsements").insert({ endorser_id: user.id, endorsed_id: endorsedId, skill });
      }
    },
    onSuccess: (_, { endorsedId }) => {
      queryClient.invalidateQueries({ queryKey: ["endorsements", endorsedId] });
    },
  });
}
