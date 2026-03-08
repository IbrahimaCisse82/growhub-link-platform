import { useState, useEffect, useRef } from "react";
import { Search, Users, FileText, Calendar, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type ResultType = "profile" | "post" | "event";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  avatar?: string;
  link: string;
}

const typeConfig: Record<ResultType, { icon: any; label: string }> = {
  profile: { icon: Users, label: "Membre" },
  post: { icon: FileText, label: "Publication" },
  event: { icon: Calendar, label: "Événement" },
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<ResultType | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timeout = setTimeout(() => searchAll(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query, filter]);

  const searchAll = async (q: string) => {
    setLoading(true);
    const all: SearchResult[] = [];

    if (filter === "all" || filter === "profile") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, company_name, sector, avatar_url, skills, city")
        .eq("is_public", true)
        .or(`display_name.ilike.%${q}%,company_name.ilike.%${q}%,sector.ilike.%${q}%,city.ilike.%${q}%`)
        .limit(6);
      profiles?.forEach(p => all.push({
        id: p.user_id, type: "profile", title: p.display_name ?? "Membre",
        subtitle: [p.company_name, p.sector, p.city].filter(Boolean).join(" · "),
        avatar: p.avatar_url ?? undefined, link: `/profile/${p.user_id}`,
      }));
    }

    if (filter === "all" || filter === "post") {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, content, post_type, created_at")
        .ilike("content", `%${q}%`)
        .order("created_at", { ascending: false })
        .limit(5);
      posts?.forEach(p => all.push({
        id: p.id, type: "post", title: p.content.substring(0, 80) + (p.content.length > 80 ? "..." : ""),
        subtitle: new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        link: "/feed",
      }));
    }

    if (filter === "all" || filter === "event") {
      const { data: events } = await supabase
        .from("events")
        .select("id, title, starts_at, event_type, location")
        .ilike("title", `%${q}%`)
        .order("starts_at", { ascending: true })
        .limit(5);
      events?.forEach(e => all.push({
        id: e.id, type: "event", title: e.title,
        subtitle: [e.event_type, e.location, new Date(e.starts_at).toLocaleDateString("fr-FR")].filter(Boolean).join(" · "),
        link: "/events",
      }));
    }

    setResults(all);
    setLoading(false);
  };

  const goTo = (link: string) => { navigate(link); setOpen(false); setQuery(""); };

  const filtered = filter === "all" ? results : results.filter(r => r.type === filter);

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center bg-secondary border border-border rounded-[10px] px-3 gap-2 h-9 transition-all hover:border-primary/35 cursor-pointer max-w-[300px] flex-1">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-[13px] text-muted-foreground/60 flex-1 text-left">Rechercher...</span>
        <kbd className="hidden md:inline text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[300] backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div ref={containerRef} className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-[301] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher membres, publications, événements..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60" autoFocus />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 px-4 py-2 border-b border-border/50">
          {(["all", "profile", "post", "event"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors",
                filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              {f === "all" ? "Tout" : f === "profile" ? "Membres" : f === "post" ? "Posts" : "Événements"}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Recherche en cours...</div>
          ) : query.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Tapez au moins 2 caractères</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Aucun résultat pour "{query}"</div>
          ) : (
            filtered.map((r) => {
              const config = typeConfig[r.type];
              const Icon = config.icon;
              return (
                <button key={`${r.type}-${r.id}`} onClick={() => goTo(r.link)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left">
                  {r.type === "profile" && r.avatar ? (
                    <img src={r.avatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{r.subtitle}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">{config.label}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-border/50 text-[10px] text-muted-foreground flex justify-between">
          <span>↑↓ Naviguer · ↵ Ouvrir · Esc Fermer</span>
          <span>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
        </div>
      </div>
    </>
  );
}
