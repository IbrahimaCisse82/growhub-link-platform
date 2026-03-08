import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

export function useWarmIntros() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["warm-intros", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warm_intros" as any)
        .select("*")
        .or(`requester_id.eq.${user!.id},introducer_id.eq.${user!.id},target_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const allUserIds = [...new Set((data as any[]).flatMap((i: any) => [i.requester_id, i.introducer_id, i.target_id]))];
      const profiles = await fetchProfilesByUserIds(allUserIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return (data as any[]).map((i: any) => ({
        ...i,
        requester_profile: profileMap[i.requester_id] ?? null,
        introducer_profile: profileMap[i.introducer_id] ?? null,
        target_profile: profileMap[i.target_id] ?? null,
      }));
    },
  });
}

export function useRequestIntro() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ introducerId, targetId, message }: { introducerId: string; targetId: string; message: string }) => {
      const { error } = await supabase.from("warm_intros" as any).insert({
        requester_id: user!.id,
        introducer_id: introducerId,
        target_id: targetId,
        message,
      });
      if (error) throw error;
      // Notify the introducer
      await supabase.from("notifications").insert({
        user_id: introducerId,
        type: "connection_request" as any,
        title: "Demande d'introduction",
        message: `Quelqu'un vous demande d'introduire un contact`,
        reference_type: "warm_intro",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warm-intros"] });
    },
  });
}

export function useRespondIntro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ introId, status, introducerMessage }: { introId: string; status: "accepted" | "declined"; introducerMessage?: string }) => {
      const { error } = await supabase.from("warm_intros" as any).update({
        status,
        introducer_message: introducerMessage || null,
        updated_at: new Date().toISOString(),
      }).eq("id", introId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warm-intros"] });
    },
  });
}

// Get mutual connections between current user and a target
export function useMutualConnections(targetUserId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mutual-connections", user?.id, targetUserId],
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
    queryFn: async () => {
      // Get current user's accepted connections
      const { data: myConns } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .eq("status", "accepted");

      const myPartnerIds = new Set(
        (myConns ?? []).map(c => c.requester_id === user!.id ? c.receiver_id : c.requester_id)
      );

      // Get target's accepted connections
      const { data: theirConns } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .or(`requester_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
        .eq("status", "accepted");

      const theirPartnerIds = new Set(
        (theirConns ?? []).map(c => c.requester_id === targetUserId ? c.receiver_id : c.requester_id)
      );

      // Find intersection (mutual connections)
      const mutualIds = [...myPartnerIds].filter(id => theirPartnerIds.has(id));

      if (mutualIds.length === 0) return [];
      const profiles = await fetchProfilesByUserIds(mutualIds);
      return profiles;
    },
  });
}
