import { Bell, MessageSquare, Menu, Sun, Moon, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useUnreadNotificationsCount, useUnreadMessagesCount } from "@/hooks/useUnreadCounts";
import GlobalSearch from "@/components/GlobalSearch";

interface TopbarProps {
  onMobileMenuToggle: () => void;
  onHelpToggle?: () => void;
}

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: unreadNotifs = 0 } = useUnreadNotificationsCount();
  const { data: unreadMsgs = 0 } = useUnreadMessagesCount();

  const displayName = profile?.display_name ?? "Utilisateur";
  const initials = displayName.substring(0, 2).toUpperCase();
  const shortName = displayName.split(" ").map((n, i) => i === 0 ? n : n[0] + ".").join(" ");

  return (
    <header className="h-[60px] bg-card border-b border-border flex items-center px-4 md:px-7 gap-3.5 sticky top-0 z-[150]">
      <button onClick={onMobileMenuToggle} className="lg:hidden w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center">
        <Menu className="w-[17px] h-[17px]" />
      </button>

      <div className="font-heading font-extrabold text-lg text-foreground whitespace-nowrap mr-4 hidden md:block">
        Grow<span className="text-foreground">Hub</span><span className="text-primary">Link</span>
      </div>

      <GlobalSearch />

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
        >
          {resolvedTheme === "dark" ? <Sun className="w-[15px] h-[15px]" /> : <Moon className="w-[15px] h-[15px]" />}
        </button>
        <button
          onClick={() => navigate("/notifications")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all relative"
        >
          <Bell className="w-[15px] h-[15px]" />
          {unreadNotifs > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-bold px-1">
              {unreadNotifs > 99 ? "99+" : unreadNotifs}
            </div>
          )}
        </button>
        <button
          onClick={() => navigate("/messaging")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all relative"
        >
          <MessageSquare className="w-[15px] h-[15px]" />
          {unreadMsgs > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-bold px-1">
              {unreadMsgs > 99 ? "99+" : unreadMsgs}
            </div>
          )}
        </button>

        <div
          onClick={() => navigate("/profile")}
          className="hidden md:flex items-center gap-2 bg-card border border-border rounded-[10px] py-[5px] px-3 pl-1.5 cursor-pointer hover:border-primary/35 transition-all"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-[26px] h-[26px] rounded-full object-cover" alt="" />
          ) : (
            <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-[10px] font-extrabold text-primary-foreground">
              {initials}
            </div>
          )}
          <span className="text-[13px] font-medium">{shortName}</span>
          <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded px-[7px] py-[2px] uppercase tracking-wider">
            {profile?.company_stage ?? "Startup"}
          </span>
        </div>
      </div>
    </header>
  );
}
