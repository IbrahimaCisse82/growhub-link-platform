import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag, SectionHeader } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, Trash2, Mail, Phone, Building2, User, Target, 
  TrendingUp, Users, Megaphone, ArrowRight, Edit2, Check, X, ExternalLink 
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  user_id: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Nouveau", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  contacted: { label: "Contacté", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  qualified: { label: "Qualifié", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  proposal: { label: "Proposition", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  won: { label: "Gagné", color: "bg-primary/10 text-primary border-primary/20" },
  lost: { label: "Perdu", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const sourceOptions = ["Site web", "LinkedIn", "Recommandation", "Événement", "Autre"];

export default function MarketingPage() {
  usePageMeta({ title: "Marketing & CRM", description: "Gérez vos leads et pilotez votre prospection commerciale." });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "Site web", notes: "" });
  const [filter, setFilter] = useState<string>("all");

  // Fetch leads
  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Create lead
  const createLead = useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const { error } = await (supabase as any).from("leads").insert({
        user_id: user!.id,
        name: lead.name!,
        email: lead.email || null,
        phone: lead.phone || null,
        company: lead.company || null,
        source: lead.source || null,
        notes: lead.notes || null,
        status: "new",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead ajouté !");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setForm({ name: "", email: "", phone: "", company: "", source: "Site web", notes: "" });
      setShowForm(false);
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  // Update lead status
  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  // Delete lead
  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead supprimé");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createLead.mutate(form);
  };

  const filteredLeads = filter === "all" ? leads : leads?.filter(l => l.status === filter);
  
  const stats = {
    total: leads?.length ?? 0,
    new: leads?.filter(l => l.status === "new").length ?? 0,
    qualified: leads?.filter(l => ["qualified", "proposal"].includes(l.status)).length ?? 0,
    won: leads?.filter(l => l.status === "won").length ?? 0,
    conversionRate: leads && leads.length > 0 
      ? Math.round((leads.filter(l => l.status === "won").length / leads.length) * 100) 
      : 0,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Marketing & Prospection
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Acquérez des <span className="text-primary">clients & partenaires</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            CRM intégré, génération de leads et pipeline de conversion.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-5">
        <MetricCard icon="📋" value={String(stats.total)} label="Total leads" badge="Pipeline" badgeType="neutral" />
        <MetricCard icon="🆕" value={String(stats.new)} label="Nouveaux" badge="À traiter" badgeType="up" />
        <MetricCard icon="✅" value={String(stats.qualified)} label="Qualifiés" badge="En cours" badgeType="up" />
        <MetricCard icon="🏆" value={String(stats.won)} label="Gagnés" badge="Convertis" badgeType="up" />
        <MetricCard icon="📈" value={`${stats.conversionRate}%`} label="Conversion" badge="Taux" badgeType={stats.conversionRate > 20 ? "up" : "neutral"} />
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...Object.keys(statusLabels)].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`h-[30px] px-3 rounded-lg text-[11px] font-semibold font-heading border transition-colors ${
                filter === s ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {s === "all" ? "Tous" : statusLabels[s]?.label ?? s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau lead
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <GHCard className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Nom *</label>
              <input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="Nom du contact" 
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Email</label>
              <input 
                type="email"
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                placeholder="email@exemple.com" 
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Téléphone</label>
              <input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                placeholder="+33 6 12 34 56 78" 
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Entreprise</label>
              <input 
                value={form.company} 
                onChange={(e) => setForm({ ...form, company: e.target.value })} 
                placeholder="Nom de l'entreprise" 
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Source</label>
              <select 
                value={form.source} 
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40"
              >
                {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Notes</label>
              <input 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                placeholder="Notes (optionnel)" 
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" 
              />
            </div>
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">Annuler</button>
            <button 
              onClick={handleCreate} 
              disabled={!form.name.trim() || createLead.isPending} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </GHCard>
      )}

      {/* Leads list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !filteredLeads || filteredLeads.length === 0 ? (
        <GHCard className="text-center py-12">
          <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun lead pour le moment. Ajoutez votre premier prospect !</p>
        </GHCard>
      ) : (
        <div className="space-y-2">
          {filteredLeads.map(lead => (
            <GHCard key={lead.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-heading text-sm font-bold">{lead.name}</span>
                  {lead.company && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {lead.company}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Mail className="w-3 h-3" /> {lead.email}
                    </a>
                  )}
                  {lead.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {lead.phone}
                    </span>
                  )}
                  {lead.source && <Tag>{lead.source}</Tag>}
                </div>
                {lead.notes && <p className="text-[11px] text-muted-foreground mt-1">{lead.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={lead.status}
                  onChange={(e) => updateLeadStatus.mutate({ id: lead.id, status: e.target.value })}
                  className={`text-[10px] font-bold rounded-lg px-2 py-1 border ${statusLabels[lead.status]?.color ?? "bg-secondary"}`}
                >
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <button 
                  onClick={() => deleteLead.mutate(lead.id)} 
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GHCard>
          ))}
        </div>
      )}

      {/* Pipeline visualization */}
      {leads && leads.length > 0 && (
        <div className="mt-6">
          <SectionHeader title="📊 Pipeline visuel" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {Object.entries(statusLabels).map(([status, config]) => {
              const count = leads.filter(l => l.status === status).length;
              return (
                <GHCard key={status} className="text-center py-4">
                  <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${config.color}`}>
                    {config.label}
                  </div>
                  <div className="font-heading text-2xl font-extrabold">{count}</div>
                  <div className="text-[10px] text-muted-foreground">leads</div>
                </GHCard>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
