import { 
  Zap, PenLine, DollarSign, Home, Users, Calendar,
  BarChart3, MessageSquare, Settings, Bell, LogOut, Megaphone,
  BookOpen, Rss, Award, Target, User, Gift, CircleDot, Bolt, FolderKanban,
  Trophy, FileText, Shield, TrendingUp, ShoppingBag, MailPlus, Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useActivatedTools } from "@/hooks/useActivatedTools";

interface SidebarProps {
  activeRole?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// Only Principal + Communauté sections per role — no more static "Outils"
const navByRole: Record<string, { title: string; items: { path: string; icon: any; label: string }[] }[]> = {
  startup: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/pitchdeck", icon: BookOpen, label: "Pitch Deck" },
      { path: "/fundraising", icon: DollarSign, label: "Levée" },
      { path: "/coaching", icon: PenLine, label: "Coaching" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  mentor: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/coaching", icon: PenLine, label: "Coaching Hub" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  investor: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/fundraising", icon: DollarSign, label: "Deal Flow" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  expert: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/coaching", icon: PenLine, label: "Mes Services" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  freelance: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/coaching", icon: PenLine, label: "Mes Missions" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  incubateur: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/networking", icon: Users, label: "Startups" },
      { path: "/coaching", icon: PenLine, label: "Programmes" },
    ]},
    { title: "Communauté", items: [
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  etudiant: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/coaching", icon: PenLine, label: "Mentorat" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  aspirationnel: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/coaching", icon: PenLine, label: "Coaching" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Inspiration" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  professionnel: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/coaching", icon: PenLine, label: "Formation" },
    ]},
    { title: "Communauté", items: [
      { path: "/networking", icon: Users, label: "Networking" },
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
  corporate: [
    { title: "Principal", items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/networking", icon: Users, label: "Startups" },
      { path: "/fundraising", icon: DollarSign, label: "Investissements" },
    ]},
    { title: "Communauté", items: [
      { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
      { path: "/circles", icon: CircleDot, label: "Cercles" },
      { path: "/spaces", icon: FolderKanban, label: "Espaces" },
      { path: "/events", icon: Calendar, label: "Événements" },
      { path: "/feed", icon: Rss, label: "Fil d'actu" },
      { path: "/messaging", icon: MessageSquare, label: "Messages" },
    ]},
  ],
};

export default function AppSidebar({ activeRole = "startup", mobileOpen = false, onMobileClose }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { activatedTools } = useActivatedTools();

  const baseSections = navByRole[activeRole] || navByRole.startup;

  // Build dynamic "Mes outils" section from activated tools + always show Marketplace
  const toolsItems: { path: string; icon: any; label: string }[] = [
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    ...activatedTools.map(t => ({ path: t.path, icon: t.lucideIcon, label: t.label })),
  ];

  const navSections = [
    ...baseSections,
    { title: "Mes outils", items: toolsItems },
  ];

  const initials = (profile?.display_name ?? "?").substring(0, 2).toUpperCase();

  const handleNav = (path: string) => {
    navigate(path);
    onMobileClose?.();
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const expanded = isHovered || mobileOpen;

  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        "fixed top-0 left-0 bottom-0 z-[200] flex flex-col items-center py-4 transition-all duration-300 bg-sidebar-bg",
        mobileOpen ? "w-[220px] translate-x-0" : "w-[220px] -translate-x-full lg:translate-x-0",
        !mobileOpen && (isHovered ? "lg:w-[220px]" : "lg:w-[68px]")
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center mb-4 cursor-pointer flex-shrink-0 relative overflow-hidden" onClick={() => handleNav("/")} aria-label="Accueil GrowHub">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
        <Zap className="w-5 h-5 text-primary-foreground relative z-10" aria-hidden="true" />
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-1 flex-1 w-full px-3 overflow-y-auto scrollbar-thin">
        {navSections.map((section, si) => (
          <div key={si}>
            {expanded && (
              <div className="text-[9px] font-bold uppercase tracking-[.1em] text-sidebar-fg/60 px-3 pt-3 pb-1">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 flex-shrink-0 overflow-hidden",
                    expanded ? "w-full justify-start px-4 h-11" : "w-11 h-11 justify-center mx-auto",
                    active ? "bg-primary/20 text-primary" : "text-sidebar-fg hover:bg-card hover:text-foreground"
                  )}
                >
                  {active && <div className="absolute left-0 w-[3px] h-[22px] bg-primary rounded-r-sm" />}
                  <item.icon className="w-[17px] h-[17px] flex-shrink-0" aria-hidden="true" />
                  {expanded && (
                    <span className={cn("font-heading text-xs font-bold whitespace-nowrap", active ? "text-primary" : "text-sidebar-fg")}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
            {si < navSections.length - 1 && <div className="h-px bg-sidebar-fg/20 mx-3 my-2" />}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 mt-auto pt-2">
        {[
          { path: "/bookmarks", icon: Bookmark, label: "Favoris" },
          { path: "/referral", icon: Gift, label: "Parrainage" },
          { path: "/notifications", icon: Bell, label: "Notifications", hasIndicator: true },
          { path: "/profile", icon: User, label: "Mon Profil" },
          { path: "/settings", icon: Settings, label: "Paramètres" },
        ].map((btn) => (
          <button
            key={btn.path}
            onClick={() => handleNav(btn.path)}
            className={cn(
              "relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sidebar-fg hover:bg-card hover:text-foreground",
              expanded ? "w-[188px] justify-start px-4 h-11" : "w-11 h-11 justify-center"
            )}
          >
            <btn.icon className="w-[17px] h-[17px] flex-shrink-0" />
            {expanded && <span className="font-heading text-xs font-bold text-sidebar-fg">{btn.label}</span>}
            {btn.hasIndicator && <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 bg-destructive rounded-full" />}
          </button>
        ))}
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sidebar-fg hover:bg-destructive/20 hover:text-destructive",
            expanded ? "w-[188px] justify-start px-4 h-11" : "w-11 h-11 justify-center"
          )}
        >
          <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
          {expanded && <span className="font-heading text-xs font-bold text-destructive">Déconnexion</span>}
        </button>
        <div
          onClick={() => handleNav("/profile")}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-xs font-extrabold text-primary-foreground border-2 border-secondary flex-shrink-0 cursor-pointer overflow-hidden"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
          ) : initials}
        </div>
      </div>
    </nav>
  );
}
