import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

export function useCompanyPage(ownerId?: string) {
  return useQuery({
    queryKey: ["company-page", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_pages" as any)
        .select("*")
        .eq("owner_id", ownerId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCompanyMembers(companyId?: string) {
  return useQuery({
    queryKey: ["company-members", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_members" as any)
        .select("*")
        .eq("company_id", companyId!);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const userIds = (data as any[]).map((m: any) => m.user_id);
      const profiles = await fetchProfilesByUserIds(userIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return (data as any[]).map((m: any) => ({ ...m, profile: profileMap[m.user_id] ?? null }));
    },
  });
}

export function useCreateCompanyPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (page: { name: string; description?: string; sector?: string; stage?: string; website?: string; location?: string; team_size?: string; founded_year?: number }) => {
      const { error } = await supabase.from("company_pages" as any).insert({
        owner_id: user!.id,
        ...page,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-page"] });
    },
  });
}

export function useUpdateCompanyPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("company_pages" as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-page"] });
    },
  });
}

export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ["recommendations", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recommendations" as any)
        .select("*")
        .eq("recommended_id", userId!)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const recommenderIds = [...new Set((data as any[]).map((r: any) => r.recommender_id))];
      const profiles = await fetchProfilesByUserIds(recommenderIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return (data as any[]).map((r: any) => ({ ...r, recommender_profile: profileMap[r.recommender_id] ?? null }));
    },
  });
}

export function useAddRecommendation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ recommendedId, skill, message }: { recommendedId: string; skill: string; message?: string }) => {
      const { error } = await supabase.from("recommendations" as any).insert({
        recommender_id: user!.id,
        recommended_id: recommendedId,
        skill,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}
