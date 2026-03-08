import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, SectionHeader, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, ShoppingBag, Star, Clock, DollarSign, Search,
  Briefcase, Code, Palette, TrendingUp, BookOpen, Users, Edit2, Trash2, Eye
} from "lucide-react";

const categories = [
  { value: "consulting", label: "Conseil", icon: Briefcase },
  { value: "development", label: "Développement", icon: Code },
  { value: "design", label: "Design", icon: Palette },
  { value: "marketing", label: "Marketing", icon: TrendingUp },
  { value: "coaching", label: "Coaching", icon: BookOpen },
  { value: "other", label: "Autre", icon: Users },
];

const priceTypes = [
  { value: "fixed", label: "Prix fixe" },
  { value: "hourly", label: "À l'heure" },
  { value: "free", label: "Gratuit" },
  { value: "negotiable", label: "Sur devis" },
];

export default function MarketplacePage() {
  usePageMeta({ title: "Marketplace", description: "Proposez et trouvez des services entre membres." });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({
    title: "", description: "", category: "consulting", price_type: "fixed",
    price: "", duration_minutes: "", tags: "",
  });

  const { data: allServices, isLoading } = useQuery({
    queryKey: ["marketplace-services"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("marketplace_services")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["marketplace-profiles"],
    enabled: !!user && !!allServices,
    queryFn: async () => {
      const userIds = [...new Set(allServices?.map((s: any) => s.user_id) ?? [])];
      if (userIds.length === 0) return {};
      const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url, headline").in("user_id", userIds);
      return Object.fromEntries((data ?? []).map(p => [p.user_id, p]));
    },
  });

  const createService = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("marketplace_services").insert({
        user_id: user!.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        price_type: form.price_type,
        price: form.price ? Number(form.price) : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()) : [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service publié !");
      queryClient.invalidateQueries({ queryKey: ["marketplace-services"] });
      setForm({ title: "", description: "", category: "consulting", price_type: "fixed", price: "", duration_minutes: "", tags: "" });
      setShowForm(false);
    },
    onError: () => toast.error("Erreur lors de la publication"),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("marketplace_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service supprimé");
      queryClient.invalidateQueries({ queryKey: ["marketplace-services"] });
    },
  });

  const bookService = useMutation({
    mutationFn: async (service: any) => {
      const { error } = await (supabase as any).from("service_bookings").insert({
        service_id: service.id,
        buyer_id: user!.id,
        seller_id: service.user_id,
        message: `Intéressé par votre service "${service.title}"`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Demande envoyée au prestataire !");
    },
    onError: () => toast.error("Erreur"),
  });

  const myServices = allServices?.filter((s: any) => s.user_id === user?.id) ?? [];
  const displayedServices = activeTab === "my" 
    ? myServices 
    : allServices?.filter((s: any) => {
        const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCat === "all" || s.category === filterCat;
        return matchSearch && matchCat;
      }) ?? [];

  const stats = {
    total: allServices?.length ?? 0,
    mine: myServices.length,
    categories: new Set(allServices?.map((s: any) => s.category)).size,
  };

  const formatPrice = (s: any) => {
    if (s.price_type === "free") return "Gratuit";
    if (s.price_type === "negotiable") return "Sur devis";
    if (!s.price) return "—";
    return `${s.price}€${s.price_type === "hourly" ? "/h" : ""}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Marketplace
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Services entre <span className="text-primary">membres</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Proposez vos compétences et trouvez les experts dont vous avez besoin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-5">
        <MetricCard icon="🛒" value={String(stats.total)} label="Services" badge="Total" badgeType="neutral" />
        <MetricCard icon="📦" value={String(stats.mine)} label="Mes services" badge="Publiés" badgeType="up" />
        <MetricCard icon="📂" value={String(stats.categories)} label="Catégories" badge="Actives" badgeType="neutral" />
      </div>

      {/* Tabs + actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {(["browse", "my"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-[30px] px-3 rounded-lg text-[11px] font-semibold font-heading border transition-colors ${
                activeTab === tab ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"
              }`}
            >
              {tab === "browse" ? "Explorer" : "Mes services"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Proposer un service
        </button>
      </div>

      {/* Search & filter */}
      {activeTab === "browse" && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex items-center bg-card border border-border rounded-lg px-3 gap-2 h-9 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un service..."
              className="bg-transparent border-none outline-none text-xs w-full"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterCat("all")}
              className={`h-9 px-2.5 rounded-lg text-[10px] font-bold border ${filterCat === "all" ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"}`}
            >
              Tous
            </button>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilterCat(cat.value)}
                className={`h-9 px-2.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${filterCat === cat.value ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"}`}
              >
                <cat.icon className="w-3 h-3" /> {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <GHCard className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Titre *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Audit SEO complet"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Catégorie</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Type de tarif</label>
              <select value={form.price_type} onChange={e => setForm({ ...form, price_type: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40">
                {priceTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {form.price_type !== "free" && form.price_type !== "negotiable" && (
              <div>
                <label className="text-xs font-bold text-foreground/70 mb-1 block">Prix (€)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Durée (min)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} placeholder="60"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Tags (séparés par ,)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="SEO, audit, stratégie"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Décrivez votre service..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40 resize-none" />
            </div>
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">Annuler</button>
            <button onClick={() => createService.mutate()} disabled={!form.title.trim() || createService.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">
              Publier
            </button>
          </div>
        </GHCard>
      )}

      {/* Services grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : displayedServices.length === 0 ? (
        <GHCard className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {activeTab === "my" ? "Vous n'avez pas encore publié de service." : "Aucun service trouvé."}
          </p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedServices.map((service: any) => {
            const profile = (profiles as any)?.[service.user_id];
            const cat = categories.find(c => c.value === service.category);
            const CatIcon = cat?.icon ?? Briefcase;
            const isMine = service.user_id === user?.id;

            return (
              <GHCard key={service.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CatIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold line-clamp-1">{service.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{profile?.display_name ?? "Membre"}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-primary font-heading">{formatPrice(service)}</span>
                </div>
                {service.description && (
                  <p className="text-xs text-foreground/60 mb-2 line-clamp-2">{service.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  <Tag>{cat?.label}</Tag>
                  {service.duration_minutes && (
                    <Tag><Clock className="w-2.5 h-2.5 inline mr-0.5" />{service.duration_minutes}min</Tag>
                  )}
                  {service.tags?.slice(0, 3).map((t: string) => <Tag key={t}>{t}</Tag>)}
                </div>
                <div className="mt-auto flex gap-2">
                  {isMine ? (
                    <button onClick={() => deleteService.mutate(service.id)}
                      className="flex-1 h-8 rounded-lg border border-destructive/30 text-destructive text-xs font-bold flex items-center justify-center gap-1 hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  ) : (
                    <button onClick={() => bookService.mutate(service)}
                      className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary-hover transition-colors">
                      <ShoppingBag className="w-3 h-3" /> Réserver
                    </button>
                  )}
                </div>
              </GHCard>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
