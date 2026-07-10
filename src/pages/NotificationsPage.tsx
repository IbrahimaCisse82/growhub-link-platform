import { motion } from "framer-motion";
import { GHCard, Tag } from "@/components/ui-custom";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Users, Calendar, MessageSquare, Award, Zap } from "lucide-react";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "react-i18next";

const typeConfig: Record<string, { icon: any; color: string; key: string }> = {
  connection_request: { icon: Users, color: "blue", key: "connection_request" },
  connection_accepted: { icon: Users, color: "green", key: "connection_accepted" },
  coaching_booked: { icon: Zap, color: "purple", key: "coaching_booked" },
  coaching_reminder: { icon: Bell, color: "orange", key: "coaching_reminder" },
  event_reminder: { icon: Calendar, color: "teal", key: "event_reminder" },
  post_reaction: { icon: MessageSquare, color: "green", key: "post_reaction" },
  post_comment: { icon: MessageSquare, color: "blue", key: "post_comment" },
  badge_earned: { icon: Award, color: "orange", key: "badge_earned" },
  system: { icon: Bell, color: "default", key: "system" },
};

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  usePageMeta({ title: t("nav.notifications"), description: t("notifications.seoDesc") });
  const { user } = useAuth();
  const { data: notifications, isLoading, refetch } = useNotifications();

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    toast.success(t("notifications.markedAllRead"));
    refetch();
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;
  const locale = i18n.language === "en" ? "en-US" : "fr-FR";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" aria-hidden="true" />
              {t("nav.notifications")}
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
              {t("notifications.title")} <span className="text-primary">{t("notifications.titleAccent")}</span>
            </h1>
            <p className="text-foreground/60 text-sm">{t("notifications.unread", { count: unreadCount })}</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              aria-label={t("notifications.markAllRead")}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors self-start min-h-11"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" /> {t("notifications.markAllRead")}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl mb-2" />)
      ) : !notifications || notifications.length === 0 ? (
        <GHCard className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t("notifications.empty")}</p>
        </GHCard>
      ) : (
        <ul className="space-y-2" aria-live="polite">
          {notifications.map((n) => {
            const config = typeConfig[n.type] || typeConfig.system;
            const Icon = config.icon;
            return (
              <li key={n.id}>
                <GHCard className={`flex items-start sm:items-center gap-3 py-3 ${!n.is_read ? "border-l-4 border-l-primary" : ""}`}>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-xs font-bold">{n.title}</span>
                      <Tag variant={config.color as any}>{t(`notifications.types.${config.key}`)}</Tag>
                    </div>
                    {n.message && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 sm:truncate">{n.message}</p>}
                    <span className="text-[10px] text-muted-foreground sm:hidden block mt-1">
                      {new Date(n.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:block">
                    {new Date(n.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                  </span>
                </GHCard>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
