import { Home, Users, Rss, MessageSquare, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useUnreadMessagesCount } from "@/hooks/useUnreadCounts";

interface MobileBottomNavProps {
  onMorePress: () => void;
}

export default function MobileBottomNav({ onMorePress }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { data: unreadMsgs = 0 } = useUnreadMessagesCount();

  const tabs = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/networking", icon: Users, label: t("nav.network") },
    { path: "/feed", icon: Rss, label: t("nav.feed") },
    { path: "/messaging", icon: MessageSquare, label: t("nav.messages"), hasBadge: true },
    { path: "more", icon: Menu, label: t("nav.more") },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "more") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-card/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom" aria-label={t("nav.home")}>
      <div className="flex items-center justify-around h-[60px] px-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => tab.path === "more" ? onMorePress() : navigate(tab.path)}
              aria-label={tab.label}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-colors relative touch-target",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <tab.icon className={cn("w-[22px] h-[22px]", active && "stroke-[2.5]")} />
                {tab.hasBadge && unreadMsgs > 0 && (
                  <div className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[9px] font-bold px-1">
                    {unreadMsgs > 99 ? "99+" : unreadMsgs}
                  </div>
                )}
              </div>
              <span className={cn("text-[10px] font-medium leading-tight", active && "font-bold")}>{tab.label}</span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
