import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Flag, CreditCard, UserCheck, AlertTriangle, Download,
  Check, X, MessageSquare, Trash2, Eye,
} from "lucide-react";

type Tab = "post_reports" | "msg_reports" | "payouts" | "applications" | "disputes";

function downloadCSV(rows: any[], filename: string) {
  if (!rows.length) { toast.error("Aucune donnée à exporter"); return; }
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function BackOffice() {
  usePageMeta({ title: "Back-Office Admin", description: "Modération, paiements, candidatures coach et litiges." });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("post_reports");

  const postReports = useQuery({
    queryKey: ["bo-post-reports"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("post_reports")
        .select("*, posts(content, author_id), reporter:reporter_id(display_name)")
        .order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const msgReports = useQuery({
    queryKey: ["bo-msg-reports"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("message_reports")
        .select("*, messages(content, sender_id)")
        .order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const payouts = useQuery({
    queryKey: ["bo-payouts"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("coach_payout_requests")
        .select("*, coaches(user_id, profiles:user_id(display_name))")
        .order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const applications = useQuery({
    queryKey: ["bo-applications"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("coach_applications")
        .select("*, profiles:user_id(display_name, avatar_url)")
        .order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const disputes = useQuery({
    queryKey: ["bo-disputes"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("coaching_disputes")
        .select("*, coaching_sessions(coach_id, learner_id, scheduled_at)")
        .order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("post_reports")
        .update({ status, reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bo-post-reports"] }); toast.success("Signalement mis à jour"); },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bo-post-reports"] }); toast.success("Publication supprimée"); },
  });

  const updateMsgReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("message_reports").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bo-msg-reports"] }); toast.success("Mis à jour"); },
  });

  const updatePayout = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const patch: any = { status, updated_at: new Date().toISOString() };
      if (notes !== undefined) patch.admin_notes = notes;
      if (status === "paid" || status === "approved") patch.processed_at = new Date().toISOString();
      const { error } = await supabase.from("coach_payout_requests").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bo-payouts"] }); toast.success("Paiement mis à jour"); },
  });

  const updateApplication = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const patch: any = { status };
      if (notes !== undefined) patch.admin_notes = notes;
      const { error } = await supabase.from("coach_applications").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bo-applications"] }); toast.success("Candidature traitée"); },
  });

  const resolveDispute = useMutation({
    mutationFn: async ({ id, status, resolution }: { id: string; status: string; resolution?: string }) => {
      const patch: any = { status, resolved_by: user!.id, resolved_at: new Date().toISOString() };
      if (resolution !== undefined) patch.resolution = resolution;
      const { error } = await supabase.from("coaching_disputes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bo-disputes"] }); toast.success("Litige résolu"); },
  });

  const pendingPostReports = (postReports.data ?? []).filter((r: any) => r.status === "pending").length;
  const pendingPayouts = (payouts.data ?? []).filter((p: any) => p.status === "pending").length;
  const pendingApps = (applications.data ?? []).filter((a: any) => a.status === "pending").length;
  const openDisputes = (disputes.data ?? []).filter((d: any) => d.status !== "resolved" && d.status !== "closed").length;

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "post_reports", label: "Signalements posts", icon: Flag, count: pendingPostReports },
    { key: "msg_reports", label: "Signalements messages", icon: MessageSquare, count: (msgReports.data ?? []).filter((m: any) => m.status === "pending").length },
    { key: "payouts", label: "Retraits coachs", icon: CreditCard, count: pendingPayouts },
    { key: "applications", label: "Candidatures coachs", icon: UserCheck, count: pendingApps },
    { key: "disputes", label: "Litiges", icon: AlertTriangle, count: openDisputes },
  ];

  const exportCurrent = () => {
    const map: Record<Tab, { rows: any[]; name: string }> = {
      post_reports: { rows: postReports.data ?? [], name: "post_reports.csv" },
      msg_reports: { rows: msgReports.data ?? [], name: "message_reports.csv" },
      payouts: { rows: payouts.data ?? [], name: "coach_payouts.csv" },
      applications: { rows: applications.data ?? [], name: "coach_applications.csv" },
      disputes: { rows: disputes.data ?? [], name: "coaching_disputes.csv" },
    };
    const { rows, name } = map[tab];
    downloadCSV(rows.map((r: any) => ({ ...r })), name);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-br from-card to-destructive/5 border-2 border-destructive/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-destructive uppercase tracking-wider mb-3.5">
            <Shield className="w-3.5 h-3.5" /> Back-Office
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Administration <span className="text-destructive">avancée</span>
          </h1>
          <p className="text-foreground/60 text-sm max-w-[520px]">
            Traitement des signalements, paiements coachs, candidatures et litiges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MetricCard icon="🚩" value={String(pendingPostReports)} label="Signalements" badge="En attente" badgeType={pendingPostReports > 0 ? "down" : "neutral"} />
        <MetricCard icon="💳" value={String(pendingPayouts)} label="Retraits" badge="À traiter" badgeType={pendingPayouts > 0 ? "down" : "neutral"} />
        <MetricCard icon="✋" value={String(pendingApps)} label="Candidatures" badge="Coachs" badgeType={pendingApps > 0 ? "up" : "neutral"} />
        <MetricCard icon="⚖️" value={String(openDisputes)} label="Litiges" badge="Ouverts" badgeType={openDisputes > 0 ? "down" : "neutral"} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground/70 hover:border-primary/35"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {t.count > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${tab === t.key ? "bg-primary-foreground/20" : "bg-destructive/15 text-destructive"}`}>{t.count}</span>}
          </button>
        ))}
        <button onClick={exportCurrent} className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 transition-colors">
          <Download className="w-3.5 h-3.5" /> Exporter CSV
        </button>
      </div>

      {tab === "post_reports" && (
        <div className="space-y-3">
          {postReports.isLoading ? <Skeleton className="h-32" /> : (postReports.data ?? []).length === 0 ? (
            <GHCard className="text-center py-10"><p className="text-sm text-muted-foreground">Aucun signalement.</p></GHCard>
          ) : (postReports.data ?? []).map((r: any) => (
            <GHCard key={r.id} className={r.status === "pending" ? "border-amber-500/30" : ""}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Tag variant={r.status === "pending" ? "blue" : r.status === "actioned" ? "green" : "default"}>{r.status}</Tag>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">par {r.reporter?.display_name ?? "?"}</span>
              </div>
              <p className="text-xs font-bold text-destructive mb-1">Motif : {r.reason}</p>
              {r.details && <p className="text-xs text-muted-foreground mb-2">{r.details}</p>}
              <div className="bg-secondary/30 rounded-lg p-2 mb-2">
                <p className="text-xs line-clamp-3">{r.posts?.content ?? "(post supprimé)"}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => updateReport.mutate({ id: r.id, status: "dismissed" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold hover:bg-secondary/80"><X className="w-3 h-3" /> Rejeter</button>
                <button onClick={() => updateReport.mutate({ id: r.id, status: "actioned" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"><Check className="w-3 h-3" /> Marquer traité</button>
                {r.posts && (
                  <button onClick={() => { if (confirm("Supprimer cette publication ?")) { deletePost.mutate(r.post_id); updateReport.mutate({ id: r.id, status: "actioned" }); } }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold"><Trash2 className="w-3 h-3" /> Supprimer post</button>
                )}
              </div>
            </GHCard>
          ))}
        </div>
      )}

      {tab === "msg_reports" && (
        <div className="space-y-3">
          {msgReports.isLoading ? <Skeleton className="h-32" /> : (msgReports.data ?? []).length === 0 ? (
            <GHCard className="text-center py-10"><p className="text-sm text-muted-foreground">Aucun signalement.</p></GHCard>
          ) : (msgReports.data ?? []).map((r: any) => (
            <GHCard key={r.id}>
              <div className="flex items-center gap-2 mb-2">
                <Tag variant={r.status === "pending" ? "blue" : "default"}>{r.status}</Tag>
                <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
              </div>
              <p className="text-xs font-bold text-destructive mb-1">Motif : {r.reason}</p>
              <div className="bg-secondary/30 rounded-lg p-2 mb-2"><p className="text-xs line-clamp-3">{r.messages?.content ?? "(message)"}</p></div>
              <div className="flex gap-2">
                <button onClick={() => updateMsgReport.mutate({ id: r.id, status: "dismissed" })} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold">Rejeter</button>
                <button onClick={() => updateMsgReport.mutate({ id: r.id, status: "actioned" })} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Traité</button>
              </div>
            </GHCard>
          ))}
        </div>
      )}

      {tab === "payouts" && (
        <div className="space-y-3">
          {payouts.isLoading ? <Skeleton className="h-32" /> : (payouts.data ?? []).length === 0 ? (
            <GHCard className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune demande.</p></GHCard>
          ) : (payouts.data ?? []).map((p: any) => (
            <GHCard key={p.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-heading text-sm font-bold">{p.coaches?.profiles?.display_name ?? "Coach"}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <Tag variant={p.status === "pending" ? "blue" : p.status === "paid" ? "green" : p.status === "rejected" ? "red" : "default"}>{p.status}</Tag>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div><span className="text-muted-foreground">Montant : </span><span className="font-bold">{p.amount} {p.currency}</span></div>
                <div><span className="text-muted-foreground">Méthode : </span><span className="font-bold">{p.method}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Compte : </span><span className="font-mono text-[11px]">{p.account_details}</span></div>
              </div>
              {p.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => updatePayout.mutate({ id: p.id, status: "approved" })} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Approuver</button>
                  <button onClick={() => updatePayout.mutate({ id: p.id, status: "paid" })} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold">Marquer payé</button>
                  <button onClick={() => { const n = prompt("Motif du refus ?") ?? ""; updatePayout.mutate({ id: p.id, status: "rejected", notes: n }); }} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold">Refuser</button>
                </div>
              )}
              {p.status === "approved" && (
                <button onClick={() => updatePayout.mutate({ id: p.id, status: "paid" })} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold">Marquer payé</button>
              )}
            </GHCard>
          ))}
        </div>
      )}

      {tab === "applications" && (
        <div className="space-y-3">
          {applications.isLoading ? <Skeleton className="h-32" /> : (applications.data ?? []).length === 0 ? (
            <GHCard className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune candidature.</p></GHCard>
          ) : (applications.data ?? []).map((a: any) => (
            <GHCard key={a.id}>
              <div className="flex items-start gap-3 mb-2">
                {a.profiles?.avatar_url ? (
                  <img src={a.profiles.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><UserCheck className="w-5 h-5 text-primary" /></div>
                )}
                <div className="flex-1">
                  <p className="font-heading text-sm font-bold">{a.profiles?.display_name ?? "Candidat"}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <Tag variant={a.status === "pending" ? "blue" : a.status === "approved" ? "green" : "red"}>{a.status}</Tag>
              </div>
              {a.bio && <p className="text-xs text-foreground/80 mb-2 line-clamp-3">{a.bio}</p>}
              <div className="flex flex-wrap gap-1 mb-2 text-[10px]">
                <span className="px-2 py-0.5 bg-secondary rounded">{a.hourly_rate} {a.currency}/h</span>
                {(a.specialties ?? []).slice(0, 4).map((s: string) => <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded">{s}</span>)}
                {a.years_experience && <span className="px-2 py-0.5 bg-secondary rounded">{a.years_experience} ans XP</span>}
                {a.linkedin_url && <a href={a.linkedin_url} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> LinkedIn</a>}
              </div>
              {a.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => updateApplication.mutate({ id: a.id, status: "approved" })} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Approuver</button>
                  <button onClick={() => { const n = prompt("Motif du refus ?") ?? ""; updateApplication.mutate({ id: a.id, status: "rejected", notes: n }); }} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold">Refuser</button>
                </div>
              )}
              {a.admin_notes && <p className="text-[10px] text-muted-foreground mt-2 italic">Notes : {a.admin_notes}</p>}
            </GHCard>
          ))}
        </div>
      )}

      {tab === "disputes" && (
        <div className="space-y-3">
          {disputes.isLoading ? <Skeleton className="h-32" /> : (disputes.data ?? []).length === 0 ? (
            <GHCard className="text-center py-10"><p className="text-sm text-muted-foreground">Aucun litige.</p></GHCard>
          ) : (disputes.data ?? []).map((d: any) => (
            <GHCard key={d.id} className={d.status === "open" ? "border-destructive/30" : ""}>
              <div className="flex items-center gap-2 mb-2">
                <Tag variant={d.status === "resolved" ? "green" : d.status === "closed" ? "default" : "red"}>{d.status}</Tag>
                <span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString("fr-FR")}</span>
              </div>
              <p className="text-xs font-bold mb-1">Motif : {d.reason}</p>
              {d.description && <p className="text-xs text-foreground/80 mb-2">{d.description}</p>}
              {d.resolution && <p className="text-xs text-green-600 italic mb-2">Résolution : {d.resolution}</p>}
              {d.status !== "resolved" && d.status !== "closed" && (
                <div className="flex gap-2">
                  <button onClick={() => { const r = prompt("Texte de résolution ?") ?? ""; resolveDispute.mutate({ id: d.id, status: "resolved", resolution: r }); }} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Résoudre</button>
                  <button onClick={() => resolveDispute.mutate({ id: d.id, status: "closed" })} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold">Clôturer</button>
                </div>
              )}
            </GHCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function AdminBackOfficePage() {
  return (
    <RoleGuard allowedRoles={["admin"]} fallbackMessage="Ce back-office est réservé aux administrateurs.">
      <BackOffice />
    </RoleGuard>
  );
}
