import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCorporateChallenges } from "@/hooks/useNewProfilesData";
import RoleGuard from "@/components/RoleGuard";
import { Building2, Trophy, Plus, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function CorporateContent() {
  const { t, i18n } = useTranslation();
  const { data: challenges = [], create } = useCorporateChallenges({ onlyMine: true });
  const [open, setOpen] = useState(false);
  const dateLocale = i18n.language.startsWith("fr") ? "fr-FR" : "en-US";

  const stats = {
    total: challenges.length,
    open: challenges.filter(c => c.status === "open").length,
    reviewing: challenges.filter(c => c.status === "reviewing").length,
    closed: challenges.filter(c => c.status === "closed" || c.status === "awarded").length,
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🎯" value={String(stats.total)} label={t("corporate.total")} badge={t("corporate.totalBadge")} badgeType="neutral" />
        <MetricCard icon="🟢" value={String(stats.open)} label={t("corporate.open")} badge={t("corporate.openBadge")} badgeType="up" />
        <MetricCard icon="🔍" value={String(stats.reviewing)} label={t("corporate.reviewing")} badge={t("corporate.reviewingBadge")} badgeType="neutral" />
        <MetricCard icon="🏆" value={String(stats.closed)} label={t("corporate.closed")} badge={t("corporate.closedBadge")} badgeType="neutral" />
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="font-heading text-lg font-bold">{t("corporate.myChallenges")}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />{t("corporate.publishChallenge")}</Button></DialogTrigger>
          <ChallengeDialog onSubmit={(p) => { create.mutate(p); setOpen(false); }} />
        </Dialog>
      </div>

      <div className="space-y-3">
        {challenges.length === 0 ? (
          <GHCard className="text-center py-10">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">{t("corporate.emptyTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("corporate.emptyDesc")}</p>
          </GHCard>
        ) : challenges.map(c => (
          <GHCard key={c.id}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-heading text-sm font-bold">{c.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
              </div>
              <Tag variant={c.status === "open" ? "green" : "default"}>{c.status}</Tag>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {c.industry && <Tag>{c.industry}</Tag>}
              {c.budget_range && <Tag>{c.budget_range}</Tag>}
              {c.deadline && <Tag>{t("corporate.deadline", { date: new Date(c.deadline).toLocaleDateString(dateLocale) })}</Tag>}
              {(c.tags ?? []).map((t: string) => <Tag key={t}>{t}</Tag>)}
            </div>
          </GHCard>
        ))}
      </div>
    </>
  );
}

function ChallengeDialog({ onSubmit }: { onSubmit: (p: any) => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: "",
    description: "",
    industry: "",
    budget_range: "",
    deadline: "",
    requirements: "",
    status: "open",
    tags: "",
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{t("corporate.newChallenge")}</DialogTitle></DialogHeader>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto">
        <div><Label>{t("corporate.labelTitle")}</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>{t("corporate.labelDescription")}</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>{t("corporate.labelIndustry")}</Label><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
          <div><Label>{t("corporate.labelBudget")}</Label><Input value={form.budget_range} onChange={e => setForm({ ...form, budget_range: e.target.value })} placeholder="50k-200k €" /></div>
        </div>
        <div><Label>{t("corporate.labelDeadline")}</Label><Input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
        <div><Label>{t("corporate.labelRequirements")}</Label><Textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} /></div>
        <div><Label>{t("corporate.labelTags")}</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
        <div>
          <Label>{t("corporate.labelStatus")}</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{t("corporate.statusDraft")}</SelectItem>
              <SelectItem value="open">{t("corporate.statusOpen")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => onSubmit({
          ...form,
          tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
          deadline: form.deadline || null,
        })}>{t("corporate.publish")}</Button>
      </div>
    </DialogContent>
  );
}

export default function CorporateInnovationPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("corporate.metaTitle"), description: t("corporate.metaDesc") });

  return (
    <RoleGuard allowedRoles={["corporate"]} fallbackMessage={t("corporate.roleGuardMessage")}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <Building2 className="w-3 h-3" /> {t("corporate.tag")}
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("corporate.h1a")} <span className="text-primary">{t("corporate.h1b")}</span></h1>
            <p className="text-sm text-muted-foreground max-w-lg">{t("corporate.subtitle")}</p>
          </div>
        </div>
        <CorporateContent />
      </motion.div>
    </RoleGuard>
  );
}
