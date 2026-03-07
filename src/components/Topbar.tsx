import { useState } from "react";
import { Search, Bell, MessageSquare, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const displayName = profile?.display_name ?? "Utilisateur";
  const initials = displayName.substring(0, 2).toUpperCase();
  const shortName = displayName.split(" ").map((n, i) => i === 0 ? n : n[0] + ".").join(" ");

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); setShowResults(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, company_name, sector, avatar_url")
      .or(`display_name.ilike.%${query}%,company_name.ilike.%${query}%,sector.ilike.%${query}%`)
      .eq("is_public", true)
      .limit(8);
    setSearchResults(data ?? []);
    setShowResults(true);
  };

  return (
    <header className="h-[60px] bg-card border-b border-border flex items-center px-4 md:px-7 gap-3.5 sticky top-0 z-[150]">
      <button onClick={onMobileMenuToggle} className="lg:hidden w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center">
        <Menu className="w-[17px] h-[17px]" />
      </button>

      <div className="font-heading font-extrabold text-lg text-foreground whitespace-nowrap mr-4 hidden md:block">
        Grow<span className="text-foreground">Hub</span><span className="text-primary">Link</span>
      </div>

      <div className="relative flex-1 max-w-[300px]">
        <div className="flex items-center bg-secondary border border-border rounded-[10px] px-3 gap-2 h-9 transition-all focus-within:border-primary/35 focus-within:shadow-glow">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Rechercher membres, entreprises..."
            className="bg-transparent border-none outline-none text-foreground text-[13px] w-full placeholder:text-muted-foreground/60"
          />
        </div>
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-md z-50 overflow-hidden">
            {searchResults.map((r) => (
              <button
                key={r.user_id}
                onMouseDown={() => { navigate(`/profile/${r.user_id}`); setShowResults(false); setSearchQuery(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
              >
                {r.avatar_url ? (
                  <img src={r.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {(r.display_name ?? "?").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.display_name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{[r.company_name, r.sector].filter(Boolean).join(" · ")}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

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
          <div className="absolute top-[7px] right-[7px] w-1.5 h-1.5 bg-primary rounded-full border-[1.5px] border-card" />
        </button>
        <button
          onClick={() => navigate("/messaging")}
          className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center cursor-pointer text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
        >
          <MessageSquare className="w-[15px] h-[15px]" />
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
