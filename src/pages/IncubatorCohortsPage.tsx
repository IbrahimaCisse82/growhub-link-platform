import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import RoleGuard from "@/components/RoleGuard";
import { Building2, Users, Calendar, TrendingUp, MessageSquare, Plus } from "lucide-react";
import { useIncubatorCohorts } from "@/hooks/useNewProfilesData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function IncubatorContent() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"cohorts" | "startups" | "events" | "mentoring">("cohorts");
  const [cohortOpen, setCohortOpen] = useState(false);
  const dateLocale = i18n.language.startsWith("fr") ? "fr-FR" : "en-US";

  const { data: officialCohorts = [], create: createCohort } = useIncubatorCohorts();

  // Circles created (legacy as cohorts)
  const { data: circles = [] } = useQuery({
    queryKey: ["incubator-circles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("circles").select("*").eq("created_by", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Circle members (startups in cohorts)
  const circleIds = circles.map(c => c.id);
  const { data: circleMembers = [] } = useQuery({
    queryKey: ["incubator-circle-members", circleIds],
    enabled: circleIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("circle_members").select("*").in("circle_id", circleIds);
      return data ?? [];
    },
  });

  // Member profiles
  const memberIds = [...new Set(circleMembers.map(m => m.user_id))];
  const { data: memberProfiles = {} } = useQuery({
    queryKey: ["incubator-member-profiles", memberIds],
    enabled: memberIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, company_name, sector, company_stage, avatar_url").in("user_id", memberIds);
      return Object.fromEntries((data ?? []).map(p => [p.user_id, p]));
    },
  });

  // Events organized
  const { data: events = [] } = useQuery({
    queryKey: ["incubator-events", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("organizer_id", user!.id).order("starts_at", { ascending: false });
      return data ?? [];
    },
  });

  // Coaching sessions given
  const { data: coachProfile } = useQuery({
    queryKey: ["incubator-coach", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("coaches").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: mentoringSessions = [] } = useQuery({
    queryKey: ["incubator-sessions", coachProfile?.id],
    enabled: !!coachProfile,
    queryFn: async () => {
      const { data } = await supabase.from("coaching_sessions").select("*").eq("coach_id", coachProfile!.id).order("scheduled_at", { ascending: false });
      return data ?? [];
    },
  });

  const upcomingEvents = events.filter(e => new Date(e.starts_at) > new Date());

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🏗️" value={String(officialCohorts.length)} label={t("incubator.officialCohorts")} badge={t("incubator.programBadge")} badgeType="up" />
        <MetricCard icon="🚀" value={String(memberIds.length)} label={t("incubator.startups")} badge={t("incubator.incubatedBadge")} badgeType="up" />
        <MetricCard icon="📅" value={String(upcomingEvents.length)} label={t("incubator.upcomingEvents")} badge={t("incubator.plannedBadge")} badgeType="neutral" />
        <MetricCard icon="🎯" value={String(mentoringSessions.length)} label={t("incubator.mentoringSessions")} badge={t("incubator.totalBadge")} badgeType="neutral" />
      </div>

      <div className="flex gap-1.5 mb-5 flex-wrap">
        {([
          { key: "cohorts" as const, label: t("incubator.tabCohorts"), count: officialCohorts.length },
          { key: "startups" as const, label: t("incubator.tabCircles"), count: circles.length },
          { key: "events" as const, label: t("incubator.tabEvents"), count: events.length },
          { key: "mentoring" as const, label: t("incubator.tabMentoring"), count: mentoringSessions.length },
        ]).map(t2 => (
          <button key={t2.key} onClick={() => setTab(t2.key)}
            className={`h-[34px] px-4 rounded-xl text-xs font-bold font-heading border transition-colors ${
              tab === t2.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground/50 hover:border-primary/30"
            }`}>
            {t2.label} ({t2.count})
          </button>
        ))}
      </div>

      {tab === "cohorts" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Dialog open={cohortOpen} onOpenChange={setCohortOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />{t("incubator.createCohort")}</Button></DialogTrigger>
              <CohortDialog onSubmit={(p) => { createCohort.mutate(p); setCohortOpen(false); }} />
            </Dialog>
          </div>
          {officialCohorts.length === 0 ? (
            <GHCard className="text-center py-10">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">{t("incubator.emptyCohortsTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("incubator.emptyCohortsDesc")}</p>
            </GHCard>
          ) : officialCohorts.map(c => (
            <GHCard key={c.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-heading text-sm font-bold">{c.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{c.description}</p>
                </div>
                <Tag variant={c.status === "active" ? "green" : "default"}>{c.status}</Tag>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {c.program_focus && <Tag>{c.program_focus}</Tag>}
                {c.start_date && <Tag>{t("incubator.dateFrom", { date: new Date(c.start_date).toLocaleDateString(dateLocale) })}</Tag>}
                {c.end_date && <Tag>{t("incubator.dateTo", { date: new Date(c.end_date).toLocaleDateString(dateLocale) })}</Tag>}
                <Tag>{t("incubator.capacity", { count: c.capacity })}</Tag>
              </div>
            </GHCard>
          ))}
        </div>
      )}

      {tab === "startups" && (
        <div className="space-y-4">
          {circles.length === 0 ? (
            <GHCard className="text-center py-10">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">{t("incubator.emptyCirclesTitle")}</p>
              <p className="text-xs text-muted-foreground mb-4">{t("incubator.emptyCirclesDesc")}</p>
              <button onClick={() => navigate("/circles")} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-xs font-bold">
                {t("incubator.createCohort")}
              </button>
            </GHCard>
          ) : circles.map(circle => {
            const members = circleMembers.filter(m => m.circle_id === circle.id);
            return (
              <GHCard key={circle.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold">{circle.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{circle.description || t("incubator.noDescription")}</p>
                  </div>
                  <Tag variant="green">{t("incubator.startupsCount", { count: members.length })}</Tag>
                </div>
                {members.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {members.map(m => {
                      const p = (memberProfiles as any)[m.user_id];
                      return (
                        <div key={m.id} className="flex items-center gap-2.5 bg-secondary/30 rounded-xl p-2.5 cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => navigate(`/profile/${m.user_id}`)}>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-heading text-[10px] font-extrabold text-primary">
                            {(p?.display_name ?? "?").substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">{p?.display_name ?? t("incubator.unknownStartup")}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{p?.company_name ?? ""} {p?.sector ? `· ${p.sector}` : ""}</div>
                          </div>
                          {p?.company_stage && <Tag variant="default">{p.company_stage}</Tag>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </GHCard>
            );
          })}
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <button onClick={() => navigate("/events")} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold">{t("incubator.createEvent")}</button>
          </div>
          {events.length === 0 ? (
            <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">{t("incubator.emptyEvents")}</p></GHCard>
          ) : events.map(e => (
            <GHCard key={e.id} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${new Date(e.starts_at) > new Date() ? "bg-primary/10" : "bg-secondary"}`}>
                <Calendar className={`w-4 h-4 ${new Date(e.starts_at) > new Date() ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold">{e.title}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(e.starts_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <Tag variant={new Date(e.starts_at) > new Date() ? "green" : "default"}>{new Date(e.starts_at) > new Date() ? t("incubator.upcoming") : t("incubator.past")}</Tag>
            </GHCard>
          ))}
        </div>
      )}

      {tab === "mentoring" && (
        <div className="space-y-3">
          {!coachProfile ? (
            <GHCard className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">{t("incubator.configureCoach")}</p>
              <button onClick={() => navigate("/coaching")} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-xs font-bold">{t("incubator.configure")}</button>
            </GHCard>
          ) : mentoringSessions.length === 0 ? (
            <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">{t("incubator.emptyMentoring")}</p></GHCard>
          ) : mentoringSessions.map(s => (
            <GHCard key={s.id} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === "completed" ? "bg-green-500/10" : "bg-primary/10"}`}>
                <TrendingUp className={`w-4 h-4 ${s.status === "completed" ? "text-green-600" : "text-primary"}`} />
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold">{s.topic ?? t("incubator.mentoringSession")}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(s.scheduled_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <Tag variant={s.status === "completed" ? "green" : "default"}>{s.status === "completed" ? t("incubator.completed") : s.status === "scheduled" ? t("incubator.scheduled") : s.status}</Tag>
            </GHCard>
          ))}
        </div>
      )}
    </>
  );
}

function CohortDialog({ onSubmit }: { onSubmit: (p: any) => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    description: "",
    program_focus: "",
    start_date: "",
    end_date: "",
    capacity: 10,
    status: "recruiting",
  });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{t("incubator.newCohort")}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>{t("incubator.labelName")}</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>{t("incubator.labelDescription")}</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div><Label>{t("incubator.labelProgramFocus")}</Label><Input value={form.program_focus} onChange={e => setForm({ ...form, program_focus: e.target.value })} placeholder={t("incubator.programFocusPh")} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>{t("incubator.labelStartDate")}</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><Label>{t("incubator.labelEndDate")}</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
        </div>
        <div><Label>{t("incubator.labelCapacity")}</Label><Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} /></div>
        <Button onClick={() => onSubmit({ ...form, start_date: form.start_date || null, end_date: form.end_date || null })}>{t("incubator.create")}</Button>
      </div>
    </DialogContent>
  );
}

export default function IncubatorCohortsPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("incubator.metaTitle"), description: t("incubator.metaDesc") });

  return (
    <RoleGuard allowedRoles={["incubateur"]} fallbackMessage={t("incubator.roleGuardMessage")}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <Building2 className="w-3 h-3" /> {t("incubator.tag")}
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("incubator.h1a")} <span className="text-primary">{t("incubator.h1b")}</span></h1>
            <p className="text-sm text-muted-foreground max-w-lg">{t("incubator.subtitle")}</p>
          </div>
        </div>
        <IncubatorContent />
      </motion.div>
    </RoleGuard>
  );
}
