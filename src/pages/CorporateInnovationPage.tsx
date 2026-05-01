import { useState } from "react";
import { motion } from "framer-motion";
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
  const { data: challenges = [], create } = useCorporateChallenges({ onlyMine: true });
  const [open, setOpen] = useState(false);

  const stats = {
    total: challenges.length,
    open: challenges.filter(c => c.status === "open").length,
    reviewing: challenges.filter(c => c.status === "reviewing").length,
    closed: challenges.filter(c => c.status === "closed" || c.status === "awarded").length,
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🎯" value={String(stats.total)} label="Challenges" badge="Total" badgeType="neutral" />
        <MetricCard icon="🟢" value={String(stats.open)} label="Ouverts" badge="Actifs" badgeType="up" />
        <MetricCard icon="🔍" value={String(stats.reviewing)} label="En revue" badge="Évaluation" badgeType="neutral" />
        <MetricCard icon="🏆" value={String(stats.closed)} label="Clôturés" badge="Terminés" badgeType="neutral" />
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="font-heading text-lg font-bold">Mes challenges Open Innovation</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />Publier un challenge</Button></DialogTrigger>
          <ChallengeDialog onSubmit={(p) => { create.mutate(p); setOpen(false); }} />
        </Dialog>
      </div>

      <div className="space-y-3">
        {challenges.length === 0 ? (
          <GHCard className="text-center py-10">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Aucun challenge publié</p>
            <p className="text-xs text-muted-foreground">Lancez un challenge pour scouter des startups innovantes.</p>
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
              {c.deadline && <Tag>Deadline : {new Date(c.deadline).toLocaleDateString("fr-FR")}</Tag>}
              {(c.tags ?? []).map((t: string) => <Tag key={t}>{t}</Tag>)}
            </div>
          </GHCard>
        ))}
      </div>
    </>
  );
}

function ChallengeDialog({ onSubmit }: { onSubmit: (p: any) => void }) {
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
      <DialogHeader><DialogTitle>Nouveau challenge Open Innovation</DialogTitle></DialogHeader>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto">
        <div><Label>Titre</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Secteur</Label><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
          <div><Label>Budget</Label><Input value={form.budget_range} onChange={e => setForm({ ...form, budget_range: e.target.value })} placeholder="50k-200k €" /></div>
        </div>
        <div><Label>Deadline</Label><Input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
        <div><Label>Exigences</Label><Textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} /></div>
        <div><Label>Tags (séparés par virgules)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
        <div>
          <Label>Statut</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="open">Ouvert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => onSubmit({
          ...form,
          tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
          deadline: form.deadline || null,
        })}>Publier</Button>
      </div>
    </DialogContent>
  );
}

export default function CorporateInnovationPage() {
  usePageMeta({ title: "Open Innovation", description: "Lancez vos challenges et scoutez les startups les plus innovantes." });

  return (
    <RoleGuard allowedRoles={["corporate"]} fallbackMessage="Cette page est réservée aux profils Corporate.">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <Building2 className="w-3 h-3" /> Corporate
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Open Innovation <span className="text-primary">Hub</span></h1>
            <p className="text-sm text-muted-foreground max-w-lg">Publiez des défis, scoutez des startups et accélérez vos POCs.</p>
          </div>
        </div>
        <CorporateContent />
      </motion.div>
    </RoleGuard>
  );
}
