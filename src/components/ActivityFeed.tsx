import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, MessageCircle, UserPlus, Award, Calendar, Zap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  created_at: string;
  reference_type: string | null;
}

const activityIcons: Record<string, { icon: typeof Heart; color: string }> = {
  post_reaction: { icon: Heart, color: "text-destructive" },
  post_comment: { icon: MessageCircle, color: "text-blue-500" },
  connection_request: { icon: UserPlus, color: "text-primary" },
  connection_accepted: { icon: UserPlus, color: "text-primary" },
  badge_earned: { icon: Award, color: "text-amber-500" },
  event_reminder: { icon: Calendar, color: "text-purple-500" },
  coaching_booked: { icon: Zap, color: "text-teal-500" },
  system: { icon: FileText, color: "text-muted-foreground" },
};

export default function ActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, type, title, message, created_at, reference_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setActivities((data ?? []) as ActivityItem[]);
      setLoading(false);
    };

    fetchActivities();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setActivities(prev => [payload.new as ActivityItem, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        Aucune activité récente
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, idx) => {
        const config = activityIcons[activity.type] ?? activityIcons.system;
        const Icon = config.icon;
        return (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-secondary/40",
              idx === 0 && "bg-primary/5"
            )}
          >
            <div className={cn("w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0", config.color)}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-snug">{activity.title}</p>
              {activity.message && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{activity.message}</p>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
