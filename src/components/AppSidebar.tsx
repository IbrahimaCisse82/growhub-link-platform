import { 
  Zap, Home, Users, Calendar,
  MessageSquare, Rss, CircleDot, Bolt, FolderKanban, ShoppingBag,
  BookOpen, DollarSign, PenLine, Shield, Target, BarChart3,
  Megaphone, Trophy, Award, Briefcase, Building2, TrendingUp
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

// Community items shared across all roles
const communityItems = [
  { path: "/networking", icon: Users, label: "Networking" },
  { path: "/speed-networking", icon: Bolt, label: "Speed Dating" },
  { path: "/circles", icon: CircleDot, label: "Cercles" },
  { path: "/spaces", icon: FolderKanban, label: "Espaces" },
  { path: "/events", icon: Calendar, label: "Événements" },
  { path: "/feed", icon: Rss, label: "Fil d'actu" },
  { path: "/messaging", icon: MessageSquare, label: "Messages" },
];

// Role-specific "Outils clés" shown between Principal and Communauté
const roleToolItems: Record<string, { path: string; icon: any; label: string }[]> = {
  startup: [
    { path: "/pitchdeck", icon: BookOpen, label: "Pitch Deck" },
    { path: "/fundraising", icon: DollarSign, label: "Levée de fonds" },
    { path: "/coaching", icon: PenLine, label: "Coaching" },
    { path: "/progression", icon: Target, label: "Objectifs" },
  ],
  mentor: [
    { path: "/mentor-dashboard", icon: Users, label: "Mes mentorés" },
    { path: "/coaching", icon: PenLine, label: "Mes sessions" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ],
  investor: [
    { path: "/deal-flow", icon: TrendingUp, label: "Deal Flow" },
    { path: "/deal-room", icon: Shield, label: "Deal Room" },
    { path: "/pitchdeck", icon: BookOpen, label: "Pitch Decks" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ],
  expert: [
    { path: "/marketplace", icon: ShoppingBag, label: "Mes services" },
    { path: "/coaching", icon: PenLine, label: "Consultations" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ],
  freelance: [
    { path: "/pipeline", icon: Briefcase, label: "Mon pipeline" },
    { path: "/marketplace", icon: ShoppingBag, label: "Mes offres" },
    { path: "/content-calendar", icon: Calendar, label: "Calendrier" },
    { path: "/marketing", icon: Megaphone, label: "Leads" },
  ],
  incubateur: [
    { path: "/cohorts", icon: Building2, label: "Cohortes" },
    { path: "/coaching", icon: PenLine, label: "Mentorat" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ],
  etudiant: [
    { path: "/coaching", icon: PenLine, label: "Coaching" },
    { path: "/progression", icon: Target, label: "Objectifs" },
    { path: "/challenges", icon: Trophy, label: "Challenges" },
  ],
  aspirationnel: [
    { path: "/coaching", icon: PenLine, label: "Coaching" },
    { path: "/challenges", icon: Trophy, label: "Challenges" },
  ],
  professionnel: [
    { path: "/coaching", icon: PenLine, label: "Coaching" },
    { path: "/progression", icon: Target, label: "Objectifs" },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  ],
  corporate: [
    { path: "/deal-room", icon: Shield, label: "Deal Room" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/company", icon: Home, label: "Page entreprise" },
  ],
};

export default function AppSidebar({ activeRole = "startup", mobileOpen = false, onMobileClose }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { activatedTools } = useActivatedTools();

  const roleTools = roleToolItems[activeRole] ?? roleToolItems.startup;

  // Community items — rename "Fil d'actu" for aspirationnel
  const communityItemsForRole = communityItems.map(item => {
    if (activeRole === "aspirationnel" && item.path === "/feed") {
      return { ...item, label: "Inspiration" };
    }
    if ((activeRole === "incubateur" || activeRole === "corporate") && item.path === "/networking") {
      return { ...item, label: "Startups" };
    }
    return item;
  });

  // Build extra activated tools not already in roleTools
  const roleToolPaths = new Set(roleTools.map(t => t.path));
  const extraTools = activatedTools
    .filter(t => !roleToolPaths.has(t.path))
    .map(t => ({ path: t.path, icon: t.lucideIcon, label: t.label }));

  const navSections = [
    { title: "Principal", items: [{ path: "/", icon: Home, label: "Dashboard" }] },
    { title: "Outils clés", items: roleTools },
    { title: "Communauté", items: communityItemsForRole },
    ...(extraTools.length > 0 ? [{ title: "Autres outils", items: extraTools }] : []),
  ];

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
                  key={item.path + item.label}
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

      {/* Bottom padding for scroll */}
      <div className="h-4 flex-shrink-0" />
    </nav>
  );
}
