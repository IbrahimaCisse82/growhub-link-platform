import { useState, useEffect, useRef } from "react";
import { Search, Users, FileText, Calendar, X, MapPin, Briefcase, Tag, SlidersHorizontal } from "lucide-react";
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

const roleOptions = ["startup", "mentor", "investor", "expert", "freelance", "incubateur", "etudiant", "corporate"];
const sectorSuggestions = ["Tech", "Santé", "Finance", "Éducation", "E-commerce", "SaaS", "IA", "Green Tech", "Food Tech", "Immobilier"];

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<ResultType | "all">("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2 && !roleFilter && !cityFilter && !sectorFilter) { setResults([]); return; }
    const timeout = setTimeout(() => searchAll(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query, filter, roleFilter, cityFilter, sectorFilter]);

  const searchAll = async (q: string) => {
    setLoading(true);
    const all: SearchResult[] = [];

    if (filter === "all" || filter === "profile") {
      let profileQuery = supabase
        .from("profiles")
        .select("user_id, display_name, company_name, sector, avatar_url, skills, city")
        .eq("is_public", true);

      if (q.length >= 2) {
        profileQuery = profileQuery.or(`display_name.ilike.%${q}%,company_name.ilike.%${q}%,sector.ilike.%${q}%,city.ilike.%${q}%`);
      }
      if (cityFilter) {
        profileQuery = profileQuery.ilike("city", `%${cityFilter}%`);
      }
      if (sectorFilter) {
        profileQuery = profileQuery.ilike("sector", `%${sectorFilter}%`);
      }

      const { data: profiles } = await profileQuery.limit(8);

      // If role filter, we need to cross-reference with user_roles
      let filteredProfiles = profiles ?? [];
      if (roleFilter) {
        const userIds = filteredProfiles.map(p => p.user_id);
        if (userIds.length > 0) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("user_id")
            .in("user_id", userIds)
            .eq("role", roleFilter as any);
          const roleUserIds = new Set((roles ?? []).map(r => r.user_id));
          filteredProfiles = filteredProfiles.filter(p => roleUserIds.has(p.user_id));
        }
      }

      filteredProfiles.forEach(p => all.push({
        id: p.user_id, type: "profile", title: p.display_name ?? "Membre",
        subtitle: [p.company_name, p.sector, p.city].filter(Boolean).join(" · "),
        avatar: p.avatar_url ?? undefined, link: `/profile/${p.user_id}`,
      }));
    }

    if ((filter === "all" || filter === "post") && q.length >= 2) {
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

    if ((filter === "all" || filter === "event") && q.length >= 2) {
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

  const goTo = (link: string) => { navigate(link); setOpen(false); setQuery(""); resetFilters(); };

  const resetFilters = () => {
    setRoleFilter("");
    setCityFilter("");
    setSectorFilter("");
    setShowAdvanced(false);
  };

  const filtered = filter === "all" ? results : results.filter(r => r.type === filter);
  const hasAdvancedFilters = !!roleFilter || !!cityFilter || !!sectorFilter;

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center bg-secondary border border-border rounded-[10px] px-2.5 md:px-3 gap-1.5 md:gap-2 h-8 md:h-9 transition-all hover:border-primary/35 cursor-pointer min-w-0 flex-1 max-w-[200px] md:max-w-[300px]">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-[12px] md:text-[13px] text-muted-foreground/60 flex-1 text-left truncate">Rechercher...</span>
        <kbd className="hidden md:inline text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[300] backdrop-blur-sm" onClick={() => { setOpen(false); resetFilters(); }} />
      <div className="fixed top-0 md:top-[8vh] left-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-xl h-full md:h-auto z-[301] bg-card md:border md:border-border md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:block">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher membres, publications, événements..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60" autoFocus />
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn("p-1.5 rounded-lg transition-colors", showAdvanced || hasAdvancedFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button onClick={() => { setOpen(false); resetFilters(); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Type filters */}
        <div className="flex gap-1.5 px-4 py-2 border-b border-border/50">
          {(["all", "profile", "post", "event"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors",
                filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              {f === "all" ? "Tout" : f === "profile" ? "Membres" : f === "post" ? "Posts" : "Événements"}
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="px-4 py-3 border-b border-border/50 space-y-2.5 bg-muted/30">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1">
              <SlidersHorizontal className="w-3 h-3" /> Filtres avancés
              {hasAdvancedFilters && (
                <button onClick={resetFilters} className="ml-auto text-primary text-[10px] hover:underline">
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Role filter */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
                <Briefcase className="w-3 h-3" /> Rôle
              </label>
              <div className="flex flex-wrap gap-1">
                {roleOptions.map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(roleFilter === r ? "" : r)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors capitalize",
                      roleFilter === r
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-border text-muted-foreground hover:border-primary/20"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector filter */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
                <Tag className="w-3 h-3" /> Secteur
              </label>
              <div className="flex flex-wrap gap-1">
                {sectorSuggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setSectorFilter(sectorFilter === s ? "" : s)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors",
                      sectorFilter === s
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-border text-muted-foreground hover:border-primary/20"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* City filter */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" /> Ville
              </label>
              <input
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Ex: Paris, Lyon, Dakar..."
                className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[50vh] md:max-h-[400px] overflow-y-auto flex-1 md:flex-none">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Recherche en cours...</div>
          ) : query.length < 2 && !hasAdvancedFilters ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Tapez au moins 2 caractères ou utilisez les filtres avancés</p>
              <button
                onClick={() => setShowAdvanced(true)}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mx-auto"
              >
                <SlidersHorizontal className="w-3 h-3" /> Ouvrir les filtres avancés
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Aucun résultat {query && `pour "${query}"`}
              {hasAdvancedFilters && " avec ces filtres"}
            </div>
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
