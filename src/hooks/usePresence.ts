import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

/** Heartbeat — refresh last_seen_at every 60s while the user is active */
export function usePresenceHeartbeat() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const beat = () => supabase.rpc("touch_last_seen");
    beat();
    const id = window.setInterval(beat, 60_000);
    const onVis = () => document.visibilityState === "visible" && beat();
    document.addEventListener("visibilitychange", onVis);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [user]);
}

/** True if a profile was active in the last 3 minutes */
export function isOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 3 * 60_000;
}

/** List of users I have blocked */
export function useBlockedUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["blocked-users", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("blocked_users").select("*").eq("blocker_id", user!.id);
      return data ?? [];
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { error } = await supabase.from("blocked_users").insert({
        blocker_id: user!.id, blocked_id: userId, reason: reason ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Utilisateur bloqué");
      qc.invalidateQueries({ queryKey: ["blocked-users"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (e: any) => {
      const msg = String(e?.message ?? "");
      if (msg.includes("duplicate")) toast.info("Déjà bloqué");
      else toast.error("Action impossible");
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("blocked_users").delete()
        .eq("blocker_id", user!.id).eq("blocked_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Débloqué");
      qc.invalidateQueries({ queryKey: ["blocked-users"] });
    },
  });
}

export function useReportMessage() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ messageId, reason, details }: { messageId: string; reason: string; details?: string }) => {
      const { error } = await supabase.from("message_reports").insert({
        message_id: messageId, reporter_id: user!.id, reason, details: details ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Message signalé"),
    onError: (e: any) => {
      if (String(e?.message ?? "").includes("duplicate")) toast.info("Déjà signalé");
      else toast.error("Signalement impossible");
    },
  });
}
