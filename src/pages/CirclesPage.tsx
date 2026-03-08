import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MetricCard, GHCard, Tag, SectionHeader } from "@/components/ui-custom";
import { useCircles, useCreateCircle, useJoinCircle, useLeaveCircle, useCircleMembers } from "@/hooks/useCircles";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Search, Globe, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Tech", "Business", "Marketing", "Finance", "Impact", "Design", "IA", "Santé", "Éducation"];

export default function CirclesPage() {
  usePageMeta({ title: "Cercles", description: "Rejoignez des communautés thématiques sur GrowHubLink." });
  const { user } = useAuth();
  const { data: circles, isLoading } = useCircles();
  const createCircle = useCreateCircle();
  const joinCircle = useJoinCircle();
  const leaveCircle = useLeaveCircle();

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "", isPrivate: false });

  const { data: members } = useCircleMembers(selectedCircle);

  const filteredCircles = (circles ?? []).filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.category ?? "").toLowerCase().includes(search.toLowerCase());
    if (tab === "mine") return c.is_member && matchSearch;
    return matchSearch;
  });

  const myCircles = (circles ?? []).filter(c => c.is_member);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await createCircle.mutateAsync(form);
      toast.success("Cercle créé !");
      setShowCreate(false);
      setForm({ name: "", description: "", category: "", isPrivate: false });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleJoin = async (circleId: string) => {
    try {
      await joinCircle.mutateAsync(circleId);
      toast.success("Vous avez rejoint le cercle !");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleLeave = async (circleId: string) => {
    try {
      await leaveCircle.mutateAsync(circleId);
      toast.success("Vous avez quitté le cercle");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-extrabold">🔗 Cercles</h1>
          <p className="text-xs text-muted-foreground mt-1">Communautés thématiques pour échanger et collaborer</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Créer un cercle
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🔗" value={String((circles ?? []).length)} label="Cercles disponibles" badge="Communauté" badgeType="neutral" />
        <MetricCard icon="👥" value={String(myCircles.length)} label="Mes cercles" badge={myCircles.length > 0 ? "Actif" : "Rejoindre"} badgeType={myCircles.length > 0 ? "up" : "neutral"} />
        <MetricCard icon="🌍" value={String((circles ?? []).filter(c => !c.is_private).length)} label="Cercles publics" badge="Ouverts" badgeType="up" />
        <MetricCard icon="🔒" value={String((circles ?? []).filter(c => c.is_private).length)} label="Cercles privés" badge="Sur invitation" badgeType="neutral" />
      </div>

      {/* Search + Tabs */}
      <div className="flex gap-3 items-center mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un cercle..." className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded-xl text-xs focus:ring-2 focus:ring-primary/30 outline-none" />
        </div>
        {(["all", "mine"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", tab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground/70 hover:border-primary/30")}>
            {t === "all" ? "Tous les cercles" : "Mes cercles"}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-base font-extrabold">Créer un cercle</h2>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom du cercle" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optionnel)" rows={3} className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <div>
                  <label className="text-xs font-bold text-foreground/70 mb-1.5 block">Catégorie</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setForm(f => ({ ...f, category: f.category === cat ? "" : cat }))} className={cn("px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all", form.category === cat ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground/70 border-border hover:border-primary/30")}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPrivate} onChange={e => setForm(f => ({ ...f, isPrivate: e.target.checked }))} className="rounded" />
                  <span className="text-xs font-medium">Cercle privé (sur invitation)</span>
                </label>
                <button onClick={handleCreate} disabled={!form.name.trim() || createCircle.isPending} className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 font-heading text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
                  {createCircle.isPending ? "Création..." : "Créer le cercle"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members Drawer */}
      <AnimatePresence>
        {selectedCircle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCircle(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-base font-extrabold">Membres du cercle</h2>
                <button onClick={() => setSelectedCircle(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              {members?.map(m => (
                <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-b-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[10px] font-extrabold text-primary-foreground">
                    {(m.profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{m.profile?.display_name ?? "Membre"}</div>
                    <div className="text-[10px] text-muted-foreground">{m.profile?.company_name ?? ""}</div>
                  </div>
                  {m.role === "admin" && <Tag variant="green">Admin</Tag>}
                </div>
              ))}
              {(!members || members.length === 0) && <p className="text-xs text-muted-foreground text-center py-4">Aucun membre</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filteredCircles.length === 0 ? (
        <GHCard className="text-center py-10">
          <p className="text-sm text-muted-foreground">{tab === "mine" ? "Vous n'avez rejoint aucun cercle." : "Aucun cercle trouvé."}</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCircles.map(circle => (
            <GHCard key={circle.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-lg">
                    {circle.is_private ? <Lock className="w-5 h-5 text-primary-foreground" /> : <Globe className="w-5 h-5 text-primary-foreground" />}
                  </div>
                  <div>
                    <div className="font-heading text-sm font-extrabold leading-tight">{circle.name}</div>
                    <div className="text-[10px] text-muted-foreground">par {circle.creator_profile?.display_name ?? "Membre"}</div>
                  </div>
                </div>
                {circle.category && <Tag variant="blue">{circle.category}</Tag>}
              </div>
              {circle.description && <p className="text-xs text-foreground/70 leading-relaxed mb-3 line-clamp-2">{circle.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                <button onClick={() => setSelectedCircle(circle.id)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                  <Users className="w-3.5 h-3.5" /> {circle.member_count} membre{circle.member_count !== 1 ? "s" : ""}
                </button>
                {circle.is_member ? (
                  <button onClick={() => handleLeave(circle.id)} className="text-[11px] font-bold text-destructive hover:opacity-70 transition-opacity">
                    Quitter
                  </button>
                ) : (
                  <button onClick={() => handleJoin(circle.id)} className="text-[11px] font-bold text-primary hover:opacity-70 transition-opacity">
                    Rejoindre →
                  </button>
                )}
              </div>
            </GHCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
