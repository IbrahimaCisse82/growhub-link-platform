import { Bell, Menu, Sun, Moon, HelpCircle, Bookmark, Gift, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadCounts";
import GlobalSearch from "@/components/GlobalSearch";

interface TopbarProps {
  onMobileMenuToggle: () => void;
  onHelpToggle?: () => void;
}

export default function Topbar({ onMobileMenuToggle, onHelpToggle }: TopbarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: unreadNotifs = 0 } = useUnreadNotificationsCount();

  const displayName = profile?.display_name ?? "Utilisateur";
  const initials = displayName.substring(0, 2).toUpperCase();
  const shortName = displayName.split(" ").map((n, i) => i === 0 ? n : n[0] + ".").join(" ");

  return (
    <header className="h-[56px] md:h-[60px] bg-card border-b border-border flex items-center px-3 md:px-7 gap-2 md:gap-3.5 sticky top-0 z-[150] safe-area-top">
      {/* Mobile menu */}
      <button onClick={onMobileMenuToggle} className="lg:hidden w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center flex-shrink-0">
        <Menu className="w-[17px] h-[17px]" />
      </button>

      {/* Logo desktop */}
      <div className="font-heading font-extrabold text-lg text-foreground whitespace-nowrap mr-2 md:mr-4 hidden md:block">
        Grow<span className="text-foreground">Hub</span><span className="text-primary">Link</span>
      </div>

      {/* Logo mobile compact */}
      <div className="font-heading font-extrabold text-base text-foreground whitespace-nowrap md:hidden" onClick={() => navigate("/")}>
        G<span className="text-primary">H</span>
      </div>

      {/* Search */}
      <GlobalSearch />

      <div className="flex-1" />

      <div className="flex items-center gap-1 md:gap-2">
        {onHelpToggle && (
          <button
            onClick={onHelpToggle}
            className="hidden md:flex w-9 h-9 rounded-[9px] bg-card border border-border items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
            aria-label="Aide"
          >
            <HelpCircle className="w-[15px] h-[15px]" />
          </button>
        )}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all flex-shrink-0"
        >
          {resolvedTheme === "dark" ? <Sun className="w-[15px] h-[15px]" /> : <Moon className="w-[15px] h-[15px]" />}
        </button>
        <button
          onClick={() => navigate("/notifications")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all relative flex-shrink-0"
        >
          <Bell className="w-[15px] h-[15px]" />
          {unreadNotifs > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[9px] font-bold px-0.5">
              {unreadNotifs > 99 ? "99+" : unreadNotifs}
            </div>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            {/* Desktop profile chip */}
            <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-[10px] py-[5px] px-3 pl-1.5 cursor-pointer hover:border-primary/35 transition-all">
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

            {/* Mobile avatar */}
            <div className="md:hidden w-8 h-8 rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-[10px] font-extrabold text-primary-foreground cursor-pointer flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                initials
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-2">
              <User className="w-4 h-4" />
              <span>Mon Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/bookmarks")} className="cursor-pointer gap-2">
              <Bookmark className="w-4 h-4" />
              <span>Favoris</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/referral")} className="cursor-pointer gap-2">
              <Gift className="w-4 h-4" />
              <span>Parrainage</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/notifications")} className="cursor-pointer gap-2">
              <Bell className="w-4 h-4" />
              <div className="flex flex-1 items-center justify-between">
                <span>Notifications</span>
                {unreadNotifs > 0 && (
                  <span className="bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-bold px-1.5 min-w-[18px] h-[18px]">
                    {unreadNotifs > 99 ? "99+" : unreadNotifs}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer gap-2">
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
