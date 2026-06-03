import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface EventReminder {
  id: string;
  user_id: string;
  event_id: string;
  remind_at: string;
  sent_at: string | null;
  channel: "browser" | "push" | "email";
}

const MINUTES_BEFORE_DEFAULT = 30;

async function ensureNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export function useEventReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ["event-reminders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_reminders")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as EventReminder[];
    },
  });

  const createReminder = useMutation({
    mutationFn: async ({ eventId, startsAt, title, minutesBefore = MINUTES_BEFORE_DEFAULT }:
      { eventId: string; startsAt: string; title: string; minutesBefore?: number }) => {
      const remindAt = new Date(new Date(startsAt).getTime() - minutesBefore * 60 * 1000);
      const allowed = await ensureNotificationPermission();
      const { error } = await (supabase as any)
        .from("event_reminders")
        .upsert({
          user_id: user!.id,
          event_id: eventId,
          remind_at: remindAt.toISOString(),
          channel: allowed ? "browser" : "email",
        }, { onConflict: "user_id,event_id,channel" });
      if (error) throw error;

      // Schedule local notification if in window and time is in future
      const delay = remindAt.getTime() - Date.now();
      if (allowed && delay > 0 && delay < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          try {
            new Notification("Rappel d'événement", {
              body: `${title} commence dans ${minutesBefore} min.`,
            });
          } catch { /* ignore */ }
        }, delay);
      }
    },
    onSuccess: () => {
      toast.success(`Rappel programmé ${MINUTES_BEFORE_DEFAULT} min avant l'événement.`);
      queryClient.invalidateQueries({ queryKey: ["event-reminders"] });
    },
    onError: () => toast.error("Impossible de programmer le rappel"),
  });

  const removeReminder = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase as any)
        .from("event_reminders")
        .delete()
        .eq("user_id", user!.id)
        .eq("event_id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rappel supprimé");
      queryClient.invalidateQueries({ queryKey: ["event-reminders"] });
    },
  });

  const hasReminder = (eventId: string) => reminders.some(r => r.event_id === eventId);

  return { reminders, hasReminder, createReminder, removeReminder };
}
