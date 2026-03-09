import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, ProgressBar, Tag, SectionHeader } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "@/hooks/useGrowHub";
import { toast } from "sonner";
import { Plus, Trash2, Check, Target, LayoutGrid, List, GripVertical } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";

const kanbanColumns = [
  { key: "todo", label: "À faire", color: "border-t-blue-500", bg: "bg-blue-500/5" },
  { key: "in_progress", label: "En cours", color: "border-t-orange-500", bg: "bg-orange-500/5" },
  { key: "done", label: "Terminé", color: "border-t-primary", bg: "bg-primary/5" },
];

export default function ObjectivesPage() {
  usePageMeta({ title: "Objectifs", description: "Définissez et suivez vos objectifs de croissance startup." });
  const { user } = useAuth();
  const { data: objectives, isLoading } = useObjectives();
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [form, setForm] = useState({ title: "", description: "", category: "", target_value: "100", deadline: "" });

  const completed = objectives?.filter(o => o.is_completed) ?? [];
  const inProgress = objectives?.filter(o => !o.is_completed && (o.current_value ?? 0) > 0) ?? [];
  const todo = objectives?.filter(o => !o.is_completed && (o.current_value ?? 0) === 0) ?? [];
  const allInProgress = objectives?.filter(o => !o.is_completed) ?? [];
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

  const renderObjectiveCard = (obj: any, compact = false) => {
    const pctObj = Math.round(((obj.current_value ?? 0) / (obj.target_value || 1)) * 100);
    const isDone = !!obj.is_completed;

    return (
      <GHCard key={obj.id} className={cn("flex flex-col gap-2", isDone && "opacity-60")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => handleToggle(obj.id, isDone)}
              className={cn("w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                isDone ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50")}>
              {isDone && <Check className="w-3 h-3 text-primary" />}
            </button>
            <span className={cn("font-heading text-xs font-bold truncate", isDone && "line-through")}>{obj.title}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {obj.category && <Tag>{obj.category}</Tag>}
            <button onClick={() => handleDelete(obj.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors p-0.5">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {obj.description && <p className="text-[10px] text-muted-foreground line-clamp-2">{obj.description}</p>}
        {!isDone && (
          <div className="flex items-center gap-2">
            <div className="flex-1"><ProgressBar label="" value={`${obj.current_value ?? 0}/${obj.target_value ?? 100}`} percentage={pctObj} /></div>
            {!compact && (
              <input type="range" min={0} max={obj.target_value ?? 100} value={obj.current_value ?? 0}
                onChange={(e) => handleUpdateProgress(obj.id, parseInt(e.target.value))} className="w-16 accent-primary" />
            )}
          </div>
        )}
        {obj.deadline && (
          <span className="text-[9px] text-muted-foreground">
            📅 {new Date(obj.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        )}
      </GHCard>
    );
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
        <MetricCard icon="⏳" value={String(allInProgress.length)} label="En cours" badge="Actifs" badgeType="up" />
        <MetricCard icon="📈" value={`${pct}%`} label="Taux de réussite" badge="Global" badgeType={pct >= 50 ? "up" : "neutral"} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <SectionHeader title="📋 Mes objectifs" />
          <div className="flex bg-card border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("list")}
              className={cn("p-1.5 transition-colors", viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              <List className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("kanban")}
              className={cn("p-1.5 transition-colors", viewMode === "kanban" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5" /> Nouvel objectif
        </button>
      </div>

      {showForm && (
        <GHCard className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'objectif *" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Catégorie (ex: Growth, Product...)" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            <div className="flex gap-2">
              <input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} placeholder="Cible" className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            </div>
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">Annuler</button>
            <button onClick={handleCreate} disabled={!form.title.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">Créer</button>
          </div>
        </GHCard>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-x-auto">
          {kanbanColumns.map(col => {
            const items = col.key === "todo" ? todo : col.key === "in_progress" ? inProgress : completed;
            return (
              <div key={col.key} className={cn("rounded-xl border-t-4 p-3 min-h-[200px]", col.color, col.bg)}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-xs font-bold">{col.label}</span>
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(obj => renderObjectiveCard(obj, true))}
                  {items.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center py-6">Aucun objectif</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* List View - In progress */}
          {allInProgress.length > 0 && (
            <div className="space-y-2 mb-5">
              {allInProgress.map(obj => renderObjectiveCard(obj))}
            </div>
          )}

          {/* List View - Completed */}
          {completed.length > 0 && (
            <>
              <SectionHeader title="✅ Objectifs atteints" />
              <div className="space-y-2">
                {completed.map(obj => renderObjectiveCard(obj))}
              </div>
            </>
          )}
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
