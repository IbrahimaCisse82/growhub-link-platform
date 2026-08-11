import { useState } from "react";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { GHCard, MetricCard, Tag, ProgressBar } from "@/components/ui-custom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useProDevGoals } from "@/hooks/useNewProfilesData";
import RoleGuard from "@/components/RoleGuard";
import { Target, Plus, TrendingUp, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const LEVEL_VALUE: Record<string, number> = { beginner: 25, intermediate: 50, advanced: 75, expert: 100 };

function ProContent() {
  const { t } = useTranslation();
  const { data: goals = [], create, update } = useProDevGoals();
  const [open, setOpen] = useState(false);

  const stats = {
    total: goals.length,
    inProgress: goals.filter(g => g.status === "in_progress").length,
    completed: goals.filter(g => g.status === "completed").length,
    planned: goals.filter(g => g.status === "planned").length,
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🎯" value={String(stats.total)} label={t("proDev.metrics.total")} badge={t("proDev.metrics.totalBadge")} badgeType="neutral" />
        <MetricCard icon="🚀" value={String(stats.inProgress)} label={t("proDev.metrics.inProgress")} badge={t("proDev.metrics.inProgressBadge")} badgeType="up" />
        <MetricCard icon="✅" value={String(stats.completed)} label={t("proDev.metrics.completed")} badge={t("proDev.metrics.completedBadge")} badgeType="up" />
        <MetricCard icon="📅" value={String(stats.planned)} label={t("proDev.metrics.planned")} badge={t("proDev.metrics.plannedBadge")} badgeType="neutral" />
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="font-heading text-lg font-bold">{t("proDev.sectionTitle")}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />{t("proDev.newGoal")}</Button></DialogTrigger>
          <GoalDialog onSubmit={(p) => { create.mutate(p); setOpen(false); }} />
        </Dialog>
      </div>

      <div className="space-y-3">
        {goals.length === 0 ? (
          <GHCard className="text-center py-10">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">{t("proDev.empty.title")}</p>
            <p className="text-xs text-muted-foreground">{t("proDev.empty.desc")}</p>
          </GHCard>
        ) : goals.map(g => {
          const current = LEVEL_VALUE[g.current_level ?? "beginner"] ?? 0;
          const target = LEVEL_VALUE[g.target_level ?? "intermediate"] ?? 50;
          const pct = target > 0 ? Math.round((current / target) * 100) : 0;
          return (
            <GHCard key={g.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading text-sm font-bold">{g.skill_target}</h3>
                    <Tag variant={g.status === "completed" ? "green" : "default"}>{g.status}</Tag>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{g.current_level} → {g.target_level}{g.deadline && ` · ${t("proDev.deadline", { date: new Date(g.deadline).toLocaleDateString("fr-FR") })}`}</p>
                </div>
                {g.status !== "completed" && (
                  <Button size="sm" variant="outline" onClick={() => update.mutate({ id: g.id, status: "completed" })}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />{t("proDev.finishBtn")}
                  </Button>
                )}
              </div>
              <ProgressBar label={t("proDev.progressLabel")} value={`${pct}%`} percentage={pct} />
              {g.notes && <p className="text-[11px] text-muted-foreground mt-2">{g.notes}</p>}
            </GHCard>
          );
        })}
      </div>
    </>
  );
}

function GoalDialog({ onSubmit }: { onSubmit: (p: any) => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    skill_target: "",
    current_level: "beginner",
    target_level: "intermediate",
    deadline: "",
    status: "in_progress",
    notes: "",
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{t("proDev.dialog.title")}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>{t("proDev.dialog.skillLabel")}</Label><Input value={form.skill_target} onChange={e => setForm({ ...form, skill_target: e.target.value })} placeholder={t("proDev.dialog.skillPlaceholder")} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("proDev.dialog.currentLevelLabel")}</Label>
            <Select value={form.current_level} onValueChange={(v) => setForm({ ...form, current_level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t("proDev.dialog.levels.beginner")}</SelectItem>
                <SelectItem value="intermediate">{t("proDev.dialog.levels.intermediate")}</SelectItem>
                <SelectItem value="advanced">{t("proDev.dialog.levels.advanced")}</SelectItem>
                <SelectItem value="expert">{t("proDev.dialog.levels.expert")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("proDev.dialog.targetLevelLabel")}</Label>
            <Select value={form.target_level} onValueChange={(v) => setForm({ ...form, target_level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t("proDev.dialog.levels.beginner")}</SelectItem>
                <SelectItem value="intermediate">{t("proDev.dialog.levels.intermediate")}</SelectItem>
                <SelectItem value="advanced">{t("proDev.dialog.levels.advanced")}</SelectItem>
                <SelectItem value="expert">{t("proDev.dialog.levels.expert")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>{t("proDev.dialog.deadlineLabel")}</Label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
        <div><Label>{t("proDev.dialog.notesLabel")}</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
        <Button onClick={() => onSubmit({ ...form, deadline: form.deadline || null })}>{t("proDev.dialog.createBtn")}</Button>
      </div>
    </DialogContent>
  );
}

export default function ProDevelopmentPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("proDev.metaTitle"), description: t("proDev.metaDescription") });

  return (
    <RoleGuard allowedRoles={["professionnel"]} fallbackMessage={t("proDev.guardMessage")}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <TrendingUp className="w-3 h-3" /> {t("proDev.badge")}
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
              <Trans i18nKey="proDev.title" components={{ 1: <span className="text-primary" /> }} />
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">{t("proDev.subtitle")}</p>
          </div>
        </div>
        <ProContent />
      </motion.div>
    </RoleGuard>
  );
}
