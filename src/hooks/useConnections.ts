import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { fetchProfilesByUserIds } from "./useProfiles";

export function useConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const partnerIds = data.map(c => c.requester_id === user!.id ? c.receiver_id : c.requester_id);
      const profiles = await fetchProfilesByUserIds(partnerIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => {
        const partnerId = c.requester_id === user!.id ? c.receiver_id : c.requester_id;
        return { ...c, partner_profile: profileMap[partnerId] ?? null };
      });
    },
  });
}

export function usePendingRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pending-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("receiver_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const requesterIds = data.map(c => c.requester_id);
      const profiles = await fetchProfilesByUserIds(requesterIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return data.map(c => ({
        ...c,
        requester_profile: profileMap[c.requester_id] ?? null,
      }));
    },
  });
}

export function useSendConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ receiverId, matchScore, message }: { receiverId: string; matchScore?: number; message?: string }) => {
      const { error } = await supabase.from("connections").insert({
        requester_id: user!.id,
        receiver_id: receiverId,
        match_score: matchScore,
        message,
      });
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: receiverId,
        type: "connection_request" as any,
        title: "Nouvelle demande de connexion",
        message: `${user!.email} souhaite se connecter avec vous`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });
}

export function useRespondConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ connectionId, status, requesterId }: { connectionId: string; status: "accepted" | "rejected"; requesterId?: string }) => {
      const { error } = await supabase.from("connections").update({ status }).eq("id", connectionId);
      if (error) throw error;
      if (status === "accepted" && requesterId) {
        await supabase.from("notifications").insert({
          user_id: requesterId,
          type: "connection_accepted" as any,
          title: "Connexion acceptée !",
          message: `Votre demande a été acceptée`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
