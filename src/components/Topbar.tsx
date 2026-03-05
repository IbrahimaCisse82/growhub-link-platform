import { Search, Bell, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  onNavigate: (page: string) => void;
}

const roleLabels: Record<string, string> = {
  startup: "Startup",
  mentor: "Mentor",
  investor: "Investisseur",
  expert: "Expert",
  admin: "Admin",
};

export default function Topbar({ onNavigate }: TopbarProps) {
  const { profile } = useAuth();

  const displayName = profile?.display_name ?? "Utilisateur";
  const initials = displayName.substring(0, 2).toUpperCase();
  const shortName = displayName.split(" ").map((n, i) => i === 0 ? n : n[0] + ".").join(" ");

  return (
    <header className="h-[60px] bg-card border-b border-border flex items-center px-7 gap-3.5 sticky top-0 z-[150]">
      <div className="font-heading font-extrabold text-lg text-foreground whitespace-nowrap mr-4">
        Grow<span className="text-foreground">Hub</span><span className="text-primary">Link</span>
      </div>

      <div className="flex items-center bg-secondary border border-border rounded-[10px] px-3 gap-2 h-9 w-[200px] transition-all focus-within:border-primary/35 focus-within:shadow-glow focus-within:w-[260px]">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input
          placeholder="Rechercher membres, événements..."
          className="bg-transparent border-none outline-none text-foreground text-[13px] w-full placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("notifications")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all relative"
        >
          <Bell className="w-[15px] h-[15px]" />
          <div className="absolute top-[7px] right-[7px] w-1.5 h-1.5 bg-primary rounded-full border-[1.5px] border-card" />
        </button>
        <button
          onClick={() => onNavigate("messaging")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
        >
          <MessageSquare className="w-[15px] h-[15px]" />
        </button>

        <div
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-2 bg-card border border-border rounded-[10px] py-[5px] px-3 pl-1.5 cursor-pointer hover:border-primary/35 transition-all"
        >
          <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-[10px] font-extrabold text-primary-foreground">
            {initials}
          </div>
          <span className="text-[13px] font-medium">{shortName}</span>
          <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded px-[7px] py-[2px] uppercase tracking-wider">
            {profile?.company_stage ?? "Startup"}
          </span>
        </div>
      </div>
    </header>
  );
}
