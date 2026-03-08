import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

export function useCircles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["circles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: circles, error } = await supabase
        .from("circles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: memberships } = await supabase
        .from("circle_members")
        .select("circle_id")
        .eq("user_id", user!.id);

      const memberCircleIds = new Set((memberships ?? []).map(m => m.circle_id));

      // Get member counts
      const { data: allMembers } = await supabase
        .from("circle_members")
        .select("circle_id");

      const countMap: Record<string, number> = {};
      (allMembers ?? []).forEach(m => {
        countMap[m.circle_id] = (countMap[m.circle_id] || 0) + 1;
      });

      // Get creator profiles
      const creatorIds = [...new Set((circles ?? []).map(c => c.created_by))];
      const profiles = await fetchProfilesByUserIds(creatorIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return (circles ?? []).map(c => ({
        ...c,
        is_member: memberCircleIds.has(c.id),
        member_count: countMap[c.id] || 0,
        creator_profile: profileMap[c.created_by] || null,
      }));
    },
  });
}

export function useCircleMembers(circleId: string | null) {
  return useQuery({
    queryKey: ["circle-members", circleId],
    enabled: !!circleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circle_members")
        .select("*")
        .eq("circle_id", circleId!);
      if (error) throw error;
      const userIds = data.map(m => m.user_id);
      const profiles = await fetchProfilesByUserIds(userIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      return data.map(m => ({ ...m, profile: profileMap[m.user_id] || null }));
    },
  });
}

export function useCreateCircle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ name, description, category, isPrivate }: {
      name: string; description?: string; category?: string; isPrivate?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("circles")
        .insert({ name, description, category, is_private: isPrivate ?? false, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      // Auto-join as admin
      await supabase.from("circle_members").insert({ circle_id: data.id, user_id: user!.id, role: "admin" });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["circles"] }),
  });
}

export function useJoinCircle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (circleId: string) => {
      const { error } = await supabase
        .from("circle_members")
        .insert({ circle_id: circleId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["circles"] });
      qc.invalidateQueries({ queryKey: ["circle-members"] });
    },
  });
}

export function useLeaveCircle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (circleId: string) => {
      const { error } = await supabase
        .from("circle_members")
        .delete()
        .eq("circle_id", circleId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["circles"] });
      qc.invalidateQueries({ queryKey: ["circle-members"] });
    },
  });
}
