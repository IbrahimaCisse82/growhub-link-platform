import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivatedTools, ALL_TOOLS, TOOL_CATEGORIES, ROLE_RECOMMENDED_TOOLS } from "@/hooks/useActivatedTools";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import {
  Plus, ShoppingBag, Star, Clock, DollarSign, Search,
  Briefcase, Code, Palette, TrendingUp, BookOpen, Users, Trash2,
  ToggleLeft, ToggleRight, Puzzle, ArrowRight, CheckCircle, Zap, Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";

function useServiceCategories(t: any) {
  return [
    { value: "consulting", label: t("marketplace.catConsulting"), icon: Briefcase },
    { value: "development", label: t("marketplace.catDevelopment"), icon: Code },
    { value: "design", label: t("marketplace.catDesign"), icon: Palette },
    { value: "marketing", label: t("marketplace.catMarketing"), icon: TrendingUp },
    { value: "coaching", label: t("marketplace.catCoaching"), icon: BookOpen },
    { value: "other", label: t("marketplace.catOther"), icon: Users },
  ];
}

function usePriceTypes(t: any) {
  return [
    { value: "fixed", label: t("marketplace.priceFixed") },
    { value: "hourly", label: t("marketplace.priceHourly") },
    { value: "free", label: t("marketplace.priceFree") },
    { value: "negotiable", label: t("marketplace.priceNegotiable") },
  ];
}

export default function MarketplacePage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("marketplace.metaTitle"), description: t("marketplace.metaDesc") });
  const serviceCategories = useServiceCategories(t);
  const priceTypes = usePriceTypes(t);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { activatedTools, isActivated, activateTool, deactivateTool, trackToolOpen, allTools } = useActivatedTools();
  const { role } = useUserRole();

  const [mainTab, setMainTab] = useState<"tools" | "services">("tools");
  const [toolFilter, setToolFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [serviceTab, setServiceTab] = useState<"browse" | "my">("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({
    title: "", description: "", category: "consulting", price_type: "fixed",
    price: "", duration_minutes: "", tags: "",
  });

  // Services queries
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
        user_id: user!.id, title: form.title, description: form.description || null,
        category: form.category, price_type: form.price_type,
        price: form.price ? Number(form.price) : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()) : [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("marketplace.publishedToast"));
      queryClient.invalidateQueries({ queryKey: ["marketplace-services"] });
      setForm({ title: "", description: "", category: "consulting", price_type: "fixed", price: "", duration_minutes: "", tags: "" });
      setShowForm(false);
    },
    onError: () => toast.error(t("marketplace.publishErrorToast")),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("marketplace_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("marketplace.deletedToast")); queryClient.invalidateQueries({ queryKey: ["marketplace-services"] }); },
  });

  const bookService = useMutation({
    mutationFn: async (service: any) => {
      const { error } = await (supabase as any).from("service_bookings").insert({
        service_id: service.id, buyer_id: user!.id, seller_id: service.user_id,
        message: t("marketplace.interestedMessage", { title: service.title }),
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success(t("marketplace.bookedToast")),
    onError: () => toast.error(t("marketplace.bookErrorToast")),
  });

  const myServices = allServices?.filter((s: any) => s.user_id === user?.id) ?? [];
  const displayedServices = serviceTab === "my"
    ? myServices
    : allServices?.filter((s: any) => {
        const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCat === "all" || s.category === filterCat;
        return matchSearch && matchCat;
      }) ?? [];

  const recommendedKeys = ROLE_RECOMMENDED_TOOLS[role] ?? [];
  const filteredTools = toolFilter === "all"
    ? allTools
    : toolFilter === "recommended"
    ? allTools.filter(t => recommendedKeys.includes(t.key))
    : allTools.filter(t => t.category === toolFilter);

  const formatPrice = (s: any) => {
    if (s.price_type === "free") return t("marketplace.priceFree");
    if (s.price_type === "negotiable") return t("marketplace.priceOnDemand");
    if (!s.price) return "—";
    return `${s.price}€${s.price_type === "hourly" ? "/h" : ""}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <Puzzle className="w-3 h-3" /> {t("marketplace.tag")}
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            {t("marketplace.h1a")} <span className="text-primary">{t("marketplace.h1b")}</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            {t("marketplace.subtitle")}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🧩" value={String(activatedTools.length)} label={t("marketplace.metricToolsActivated")} badge={`/ ${allTools.length}`} badgeType="neutral" />
        <MetricCard icon="🛒" value={String(allServices?.length ?? 0)} label={t("marketplace.metricServices")} badge={t("marketplace.metricServicesBadge")} badgeType="neutral" />
        <MetricCard icon="📦" value={String(myServices.length)} label={t("marketplace.metricMyServices")} badge={t("marketplace.metricMyServicesBadge")} badgeType="up" />
        <MetricCard icon="📂" value={String(new Set(allServices?.map((s: any) => s.category)).size)} label={t("marketplace.metricCategories")} badge={t("marketplace.metricCategoriesBadge")} badgeType="neutral" />
      </div>

      {/* Main tabs */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5">
          {([
            { key: "tools" as const, label: t("marketplace.tabTools"), count: allTools.length },
            { key: "services" as const, label: t("marketplace.tabServices"), count: allServices?.length ?? 0 },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className={`h-[34px] px-4 rounded-xl text-xs font-bold font-heading border transition-colors ${
                mainTab === tab.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground/50 hover:border-primary/30"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        {mainTab === "services" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> {t("marketplace.proposeService")}
          </button>
        )}
      </div>

      {/* TOOLS TAB */}
      {mainTab === "tools" && (
        <>
          {/* Tool category filter */}
          <div className="flex gap-1.5 mb-5 flex-wrap">
            {TOOL_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setToolFilter(cat.key)}
                className={`h-[30px] px-3 rounded-lg text-[11px] font-bold font-heading border transition-colors ${
                  toolFilter === cat.key
                    ? "bg-primary/10 border-primary/35 text-primary"
                    : "bg-card border-border text-foreground/50 hover:border-primary/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Recommendation banner */}
          {toolFilter === "all" && recommendedKeys.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mb-5">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold font-heading">{t("marketplace.recommendedFor")} <span className="capitalize text-primary">{role}</span></p>
                <p className="text-[11px] text-muted-foreground">{t("marketplace.recommendedHint")}</p>
              </div>
            </div>
          )}

          {/* Tools grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[...filteredTools].sort((a, b) => {
              // Sort: recommended first, then activated, then rest
              const aRec = recommendedKeys.includes(a.key) ? 0 : 1;
              const bRec = recommendedKeys.includes(b.key) ? 0 : 1;
              if (aRec !== bRec) return aRec - bRec;
              const aAct = isActivated(a.key) ? 0 : 1;
              const bAct = isActivated(b.key) ? 0 : 1;
              return aAct - bAct;
            }).map(tool => {
              const active = isActivated(tool.key);
              const ToolIcon = tool.lucideIcon;
              return (
                <GHCard
                  key={tool.key}
                  className={`flex flex-col transition-all ${
                    active ? "border-primary/30 bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                      active ? "bg-primary/15" : "bg-secondary"
                    }`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-sm font-bold truncate">{tool.label}</h3>
                        {active && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold flex-shrink-0">
                            <CheckCircle className="w-2.5 h-2.5" /> {t("marketplace.active")}
                          </span>
                        )}
                        {!active && recommendedKeys.includes(tool.key) && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold flex-shrink-0">
                            <Sparkles className="w-2.5 h-2.5" /> {t("marketplace.recommended")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    {active ? (
                      <>
                        <button
                          onClick={() => { trackToolOpen(tool.key); navigate(tool.path); }}
                          className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" /> {t("marketplace.open")}
                        </button>
                        <button
                          onClick={() => deactivateTool.mutate(tool.key)}
                          disabled={deactivateTool.isPending}
                          className="h-8 px-3 rounded-lg border border-border text-foreground/50 text-xs font-bold flex items-center gap-1.5 hover:border-destructive/30 hover:text-destructive transition-colors"
                        >
                          <ToggleRight className="w-3.5 h-3.5" /> {t("marketplace.deactivate")}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => activateTool.mutate(tool.key)}
                        disabled={activateTool.isPending}
                        className="flex-1 h-9 rounded-lg border-2 border-dashed border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/5 hover:border-primary/50 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" /> {t("marketplace.activateTool")}
                      </button>
                    )}
                  </div>
                </GHCard>
              );
            })}
          </div>
        </>
      )}

      {/* SERVICES TAB */}
      {mainTab === "services" && (
        <>
          {/* Service sub-tabs */}
          <div className="flex gap-1.5 mb-4">
            {(["browse", "my"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setServiceTab(tab)}
                className={`h-[30px] px-3 rounded-lg text-[11px] font-semibold font-heading border transition-colors ${
                  serviceTab === tab ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"
                }`}
              >
                {tab === "browse" ? t("marketplace.browse") : t("marketplace.myServices")}
              </button>
            ))}
          </div>

          {/* Search & filter */}
          {serviceTab === "browse" && (
            <div className="flex gap-2 mb-4 flex-wrap">
              <div className="flex items-center bg-card border border-border rounded-lg px-3 gap-2 h-9 flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("marketplace.searchServicePh")}
                  className="bg-transparent border-none outline-none text-xs w-full"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setFilterCat("all")}
                  className={`h-9 px-2.5 rounded-lg text-[10px] font-bold border ${filterCat === "all" ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"}`}
                >
                  {t("marketplace.all")}
                </button>
                {serviceCategories.map(cat => (
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
                  <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("marketplace.formTitle")}</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={t("marketplace.formTitlePh")}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("marketplace.formCategory")}</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40">
                    {serviceCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("marketplace.formPriceType")}</label>
                  <select value={form.price_type} onChange={e => setForm({ ...form, price_type: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40">
                    {priceTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                {form.price_type !== "free" && form.price_type !== "negotiable" && (
                  <div>
                    <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("marketplace.formPrice")}</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("marketplace.formDuration")}</label>
                  <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} placeholder="60"
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("marketplace.formTags")}</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder={t("marketplace.formTagsPh")}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("marketplace.formDescription")}</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder={t("marketplace.formDescriptionPh")}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40 resize-none" />
                </div>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">{t("marketplace.cancel")}</button>
                <button onClick={() => createService.mutate()} disabled={!form.title.trim() || createService.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">
                  {t("marketplace.publish")}
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
                {serviceTab === "my" ? t("marketplace.noServiceMine") : t("marketplace.noServiceFound")}
              </p>
            </GHCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedServices.map((service: any) => {
                const profile = (profiles as any)?.[service.user_id];
                const cat = serviceCategories.find(c => c.value === service.category);
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
                          <p className="text-[10px] text-muted-foreground">{profile?.display_name ?? t("marketplace.member")}</p>
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
                          <Trash2 className="w-3 h-3" /> {t("marketplace.delete")}
                        </button>
                      ) : (
                        <button onClick={() => bookService.mutate(service)}
                          className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary-hover transition-colors">
                          <ShoppingBag className="w-3 h-3" /> {t("marketplace.book")}
                        </button>
                      )}
                    </div>
                  </GHCard>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
