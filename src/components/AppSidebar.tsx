import { useState } from "react";
import {
  Zap, PenLine, DollarSign, Briefcase, Home, Users, Calendar,
  BarChart3, MessageSquare, Settings, Bell, LogOut, Megaphone,
  BookOpen, TrendingUp, Star, User, Rss, Award, Target, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  activeRole?: string;
}

const navByRole: Record<string, { title: string; items: { id: string; icon: any; label: string }[] }[]> = {
  startup: [
    {
      title: "Principal",
      items: [
        { id: "dashboard", icon: Home, label: "Dashboard" },
        { id: "pitchdeck", icon: BookOpen, label: "Pitch Deck" },
        { id: "fundraising", icon: DollarSign, label: "Levée" },
        { id: "coaching", icon: PenLine, label: "Coaching" },
      ],
    },
    {
      title: "Communauté",
      items: [
        { id: "networking", icon: Users, label: "Networking" },
        { id: "events", icon: Calendar, label: "Événements" },
        { id: "feed", icon: Rss, label: "Fil d'actu" },
        { id: "messaging", icon: MessageSquare, label: "Messages" },
      ],
    },
    {
      title: "Outils",
      items: [
        { id: "marketing", icon: Megaphone, label: "Marketing" },
        { id: "analytics", icon: BarChart3, label: "Analytics" },
        { id: "progression", icon: Target, label: "Objectifs" },
        { id: "badges", icon: Award, label: "Badges" },
      ],
    },
  ],
  mentor: [
    {
      title: "Principal",
      items: [
        { id: "dashboard", icon: Home, label: "Dashboard" },
        { id: "coaching", icon: PenLine, label: "Coaching Hub" },
        { id: "analytics", icon: BarChart3, label: "Performance" },
      ],
    },
    {
      title: "Communauté",
      items: [
        { id: "networking", icon: Users, label: "Networking" },
        { id: "events", icon: Calendar, label: "Événements" },
        { id: "feed", icon: Rss, label: "Fil d'actu" },
        { id: "messaging", icon: MessageSquare, label: "Messages" },
      ],
    },
    {
      title: "Outils",
      items: [
        { id: "progression", icon: Target, label: "Objectifs" },
        { id: "badges", icon: Award, label: "Badges" },
        { id: "marketing", icon: Megaphone, label: "Visibilité" },
      ],
    },
  ],
  investor: [
    {
      title: "Principal",
      items: [
        { id: "dashboard", icon: Home, label: "Dashboard" },
        { id: "fundraising", icon: DollarSign, label: "Deal Flow" },
        { id: "analytics", icon: BarChart3, label: "Portfolio" },
      ],
    },
    {
      title: "Communauté",
      items: [
        { id: "networking", icon: Users, label: "Networking" },
        { id: "events", icon: Calendar, label: "Événements" },
        { id: "feed", icon: Rss, label: "Fil d'actu" },
        { id: "messaging", icon: MessageSquare, label: "Messages" },
      ],
    },
    {
      title: "Outils",
      items: [
        { id: "coaching", icon: PenLine, label: "Coaching" },
        { id: "progression", icon: Target, label: "Objectifs" },
        { id: "badges", icon: Award, label: "Badges" },
      ],
    },
  ],
  expert: [
    {
      title: "Principal",
      items: [
        { id: "dashboard", icon: Home, label: "Dashboard" },
        { id: "coaching", icon: PenLine, label: "Mes Services" },
        { id: "analytics", icon: BarChart3, label: "Performance" },
      ],
    },
    {
      title: "Communauté",
      items: [
        { id: "networking", icon: Users, label: "Networking" },
        { id: "events", icon: Calendar, label: "Événements" },
        { id: "feed", icon: Rss, label: "Fil d'actu" },
        { id: "messaging", icon: MessageSquare, label: "Messages" },
      ],
    },
    {
      title: "Outils",
      items: [
        { id: "marketing", icon: Megaphone, label: "Prospection" },
        { id: "progression", icon: Target, label: "Objectifs" },
        { id: "badges", icon: Award, label: "Badges" },
      ],
    },
  ],
};

export default function AppSidebar({ activePage, onNavigate, activeRole = "startup" }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { signOut, profile } = useAuth();

  const navSections = navByRole[activeRole] || navByRole.startup;
  const initials = (profile?.display_name ?? "?").substring(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-[200] flex flex-col items-center py-4 transition-all duration-300 bg-sidebar-bg",
        isHovered ? "w-[220px]" : "w-[68px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center mb-4 cursor-pointer flex-shrink-0 relative overflow-hidden"
        onClick={() => onNavigate("dashboard")}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
        <Zap className="w-5 h-5 text-primary-foreground relative z-10" />
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-1 flex-1 w-full px-3 overflow-y-auto scrollbar-thin">
        {navSections.map((section, si) => (
          <div key={si}>
            {isHovered && (
              <div className="text-[9px] font-bold uppercase tracking-[.1em] text-sidebar-fg/60 px-3 pt-3 pb-1">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 flex-shrink-0 overflow-hidden",
                    isHovered ? "w-full justify-start px-4 h-11" : "w-11 h-11 justify-center mx-auto",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-sidebar-fg hover:bg-card hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 w-[3px] h-[22px] bg-primary rounded-r-sm" />
                  )}
                  <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                  {isHovered && (
                    <span className={cn(
                      "font-heading text-xs font-bold whitespace-nowrap",
                      isActive ? "text-primary" : "text-foreground/70"
                    )}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
            {si < navSections.length - 1 && (
              <div className="h-px bg-white/10 mx-3 my-2" />
            )}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 mt-auto pt-2">
        <button
          onClick={() => onNavigate("notifications")}
          className={cn(
            "relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sidebar-fg hover:bg-card hover:text-foreground",
            isHovered ? "w-[188px] justify-start px-4 h-11" : "w-11 h-11 justify-center"
          )}
        >
          <Bell className="w-[17px] h-[17px] flex-shrink-0" />
          {isHovered && <span className="font-heading text-xs font-bold text-foreground/70">Notifications</span>}
          <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 bg-destructive rounded-full" />
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className={cn(
            "flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sidebar-fg hover:bg-card hover:text-foreground",
            isHovered ? "w-[188px] justify-start px-4 h-11" : "w-11 h-11 justify-center"
          )}
        >
          <User className="w-[17px] h-[17px] flex-shrink-0" />
          {isHovered && <span className="font-heading text-xs font-bold text-foreground/70">Mon Profil</span>}
        </button>
        <button
          onClick={() => onNavigate("settings")}
          className={cn(
            "flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sidebar-fg hover:bg-card hover:text-foreground",
            isHovered ? "w-[188px] justify-start px-4 h-11" : "w-11 h-11 justify-center"
          )}
        >
          <Settings className="w-[17px] h-[17px] flex-shrink-0" />
          {isHovered && <span className="font-heading text-xs font-bold text-foreground/70">Paramètres</span>}
        </button>
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sidebar-fg hover:bg-destructive/20 hover:text-destructive",
            isHovered ? "w-[188px] justify-start px-4 h-11" : "w-11 h-11 justify-center"
          )}
        >
          <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
          {isHovered && <span className="font-heading text-xs font-bold text-destructive">Déconnexion</span>}
        </button>
        <div
          onClick={() => onNavigate("profile")}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-xs font-extrabold text-primary-foreground border-2 border-secondary flex-shrink-0 cursor-pointer"
        >
          {initials}
        </div>
      </div>
    </aside>
  );
}
