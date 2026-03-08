import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, ProgressBar, Tag, SectionHeader } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "@/hooks/useGrowHub";
import { toast } from "sonner";
import { Plus, Trash2, Check, Target } from "lucide-react";

export default function ObjectivesPage() {
  const { user } = useAuth();
  const { data: objectives, isLoading } = useObjectives();
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", target_value: "100", deadline: "" });

  const completed = objectives?.filter(o => o.is_completed) ?? [];
  const inProgress = objectives?.filter(o => !o.is_completed) ?? [];
  const pct = objectives && objectives.length > 0 ? Math.round((completed.length / objectives.length) * 100) : 0;

  const handleCreate = () => {
    if (!form.title.trim()) return;
    createObjective.mutate({
      title: form.title,
      description: form.description || undefined,
      category: form.category || undefined,
      target_value: parseInt(form.target_value) || 100,
      deadline: form.deadline || undefined,
    }, {
      onSuccess: () => { toast.success("Objectif créé !"); setForm({ title: "", description: "", category: "", target_value: "100", deadline: "" }); setShowForm(false); },
    });
  };

  const handleToggle = (id: string, currentCompleted: boolean) => {
    updateObjective.mutate({ id, is_completed: !currentCompleted }, {
      onSuccess: () => toast.success(!currentCompleted ? "Objectif atteint 🎉" : "Objectif réouvert"),
    });
  };

  const handleUpdateProgress = (id: string, value: number) => {
    updateObjective.mutate({ id, current_value: value });
  };

  const handleDelete = (id: string) => {
    deleteObjective.mutate(id, { onSuccess: () => toast.success("Supprimé") });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Objectifs & Progression
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Vos <span className="text-primary">objectifs SMART</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Définissez, suivez et atteignez vos objectifs avec un suivi détaillé.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-[18px]">
        <MetricCard icon="🎯" value={String(objectives?.length ?? 0)} label="Total objectifs" badge="Définis" badgeType="neutral" />
        <MetricCard icon="✅" value={String(completed.length)} label="Atteints" badge={`${pct}%`} badgeType="up" />
        <MetricCard icon="⏳" value={String(inProgress.length)} label="En cours" badge="Actifs" badgeType="up" />
        <MetricCard icon="📈" value={`${pct}%`} label="Taux de réussite" badge="Global" badgeType={pct >= 50 ? "up" : "neutral"} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <SectionHeader title="📋 Mes objectifs" />
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nouvel objectif
        </button>
      </div>

      {showForm && (
        <GHCard className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'objectif *" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Catégorie (ex: Growth, Product...)" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} placeholder="Cible" className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">Annuler</button>
            <button onClick={handleCreate} disabled={!form.title.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">Créer</button>
          </div>
        </GHCard>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div className="space-y-2 mb-5">
          {inProgress.map(obj => {
            const pctObj = Math.round(((obj.current_value ?? 0) / (obj.target_value || 1)) * 100);
            return (
              <GHCard key={obj.id} className="flex items-center gap-4">
                <button onClick={() => handleToggle(obj.id, !!obj.is_completed)} className="w-8 h-8 rounded-lg border-2 border-border flex items-center justify-center hover:border-primary/50 transition-colors flex-shrink-0">
                  <Target className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading text-sm font-bold">{obj.title}</span>
                    {obj.category && <Tag>{obj.category}</Tag>}
                    {obj.deadline && (
                      <span className="text-[10px] text-muted-foreground">
                        Échéance: {new Date(obj.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                  {obj.description && <p className="text-[11px] text-muted-foreground mb-1">{obj.description}</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar label="" value={`${obj.current_value ?? 0}/${obj.target_value ?? 100}`} percentage={pctObj} />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={obj.target_value ?? 100}
                      value={obj.current_value ?? 0}
                      onChange={(e) => handleUpdateProgress(obj.id, parseInt(e.target.value))}
                      className="w-24 accent-primary"
                    />
                  </div>
                </div>
                <button onClick={() => handleDelete(obj.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </GHCard>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <SectionHeader title="✅ Objectifs atteints" />
          <div className="space-y-2">
            {completed.map(obj => (
              <GHCard key={obj.id} className="flex items-center gap-4 opacity-70">
                <button onClick={() => handleToggle(obj.id, true)} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </button>
                <div className="flex-1">
                  <span className="font-heading text-sm font-bold line-through">{obj.title}</span>
                  {obj.category && <Tag variant="green" >{obj.category}</Tag>}
                </div>
                <button onClick={() => handleDelete(obj.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </GHCard>
            ))}
          </div>
        </>
      )}

      {(!objectives || objectives.length === 0) && !isLoading && (
        <GHCard className="text-center py-12">
          <Target className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun objectif défini. Commencez par en créer un !</p>
        </GHCard>
      )}
    </motion.div>
  );
}
