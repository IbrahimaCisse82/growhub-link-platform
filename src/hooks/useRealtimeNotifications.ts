import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Bell, MessageSquare, Users, Calendar, Award, Zap } from "lucide-react";

const typeLabels: Record<string, string> = {
  connection_request: "Nouvelle demande de connexion",
  connection_accepted: "Connexion acceptée",
  coaching_booked: "Session de coaching réservée",
  coaching_reminder: "Rappel de coaching",
  event_reminder: "Rappel d'événement",
  post_reaction: "Réaction sur votre post",
  post_comment: "Commentaire sur votre post",
  badge_earned: "Badge débloqué !",
  system: "Notification système",
};

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as any;
          // Invalidate cache to update badge count + list
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
          queryClient.invalidateQueries({ queryKey: ["unread-count", user.id] });

          // Show toast
          toast(notif.title || typeLabels[notif.type] || "Nouvelle notification", {
            description: notif.message || undefined,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

export function useRealtimeMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          queryClient.invalidateQueries({ queryKey: ["unread-messages", user.id] });

          toast("Nouveau message", {
            description: (payload.new as any).content?.substring(0, 80) || "Vous avez reçu un message",
            duration: 4000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

export function useUnreadNotificationsCount() {
  const { user } = useAuth();
  const { data } = useQueryClient().getQueryState(["notifications", user?.id]) ?? {};
  const notifications = (data as any[]) ?? [];
  return notifications.filter((n) => !n.is_read).length;
}
