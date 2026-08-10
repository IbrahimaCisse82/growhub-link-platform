import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GHCard, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";
import { Calendar, Plus, Edit3, Trash2, Clock, Sparkles, Send, FileText, CheckCircle } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { fr, enUS } from "date-fns/locale";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  published: "bg-green-500/10 text-green-600",
};

export default function ContentCalendarPage() {
  const { t, i18n } = useTranslation();
  usePageMeta({ title: t("contentCalendar.metaTitle"), description: t("contentCalendar.metaDesc") });
  const dateLocale = i18n.language === "en" ? enUS : fr;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", post_type: "text", scheduled_at: "", status: "draft" });

  const aiTopicSuggestions = [
    { title: t("contentCalendar.suggestionRetourTitle"), desc: t("contentCalendar.suggestionRetourDesc"), type: "text" },
    { title: t("contentCalendar.suggestionQuestionTitle"), desc: t("contentCalendar.suggestionQuestionDesc"), type: "question" },
    { title: t("contentCalendar.suggestionMilestoneTitle"), desc: t("contentCalendar.suggestionMilestoneDesc"), type: "milestone" },
    { title: t("contentCalendar.suggestionConseilTitle"), desc: t("contentCalendar.suggestionConseilDesc"), type: "resource" },
    { title: t("contentCalendar.suggestionAnnonceTitle"), desc: t("contentCalendar.suggestionAnnonceDesc"), type: "announcement" },
  ];

  const { data: entries = [] } = useQuery({
    queryKey: ["content-calendar", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any).from("content_calendar").select("*").eq("user_id", user!.id).order("scheduled_at", { ascending: true });
      return data ?? [];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (entry: any) => {
      const { error } = await (supabase as any).from("content_calendar").insert({ ...entry, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content-calendar"] }); toast.success(t("contentCalendar.plannedToast")); setShowForm(false); setForm({ title: "", content: "", post_type: "text", scheduled_at: "", status: "draft" }); },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("content_calendar").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content-calendar"] }); toast.success(t("contentCalendar.deletedToast")); },
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const drafts = entries.filter((e: any) => e.status === "draft").length;
  const scheduled = entries.filter((e: any) => e.status === "scheduled").length;
  const published = entries.filter((e: any) => e.status === "published").length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5"><span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> {t("contentCalendar.tag")}</div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("contentCalendar.h1a")} <span className="text-primary">{t("contentCalendar.h1b")}</span></h1>
          <p className="text-sm text-muted-foreground max-w-lg">{t("contentCalendar.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="📝" value={String(drafts)} label={t("contentCalendar.metricDrafts")} badge={t("contentCalendar.metricDraftsBadge")} badgeType="neutral" />
        <MetricCard icon="📅" value={String(scheduled)} label={t("contentCalendar.metricScheduled")} badge={t("contentCalendar.metricScheduledBadge")} badgeType="up" />
        <MetricCard icon="✅" value={String(published)} label={t("contentCalendar.metricPublished")} badge={t("contentCalendar.metricPublishedBadge")} badgeType="up" />
        <MetricCard icon="💡" value={String(aiTopicSuggestions.length)} label={t("contentCalendar.metricAiSuggestions")} badge={t("contentCalendar.metricAiSuggestionsBadge")} badgeType="neutral" />
      </div>

      {/* Week view */}
      <GHCard className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-sm font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {t("contentCalendar.weekOf")} {format(weekStart, "d MMMM", { locale: dateLocale })}</h2>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-bold"><Plus className="w-3.5 h-3.5" /> {t("contentCalendar.newBtn")}</button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayEntries = entries.filter((e: any) => e.scheduled_at && isSameDay(parseISO(e.scheduled_at), day));
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className={`min-h-[100px] rounded-xl border p-2 ${isToday ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                <div className={`text-[10px] font-bold mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {format(day, "EEE d", { locale: dateLocale })}
                </div>
                {dayEntries.map((e: any) => (
                  <div key={e.id} className="bg-secondary rounded-md px-1.5 py-1 mb-1 group relative">
                    <div className="text-[9px] font-medium truncate">{e.title}</div>
                    <span className={`inline-block px-1 py-0.5 rounded text-[8px] font-bold ${statusColors[e.status]}`}>{e.status}</span>
                    <button onClick={() => deleteEntry.mutate(e.id)} className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100"><Trash2 className="w-2.5 h-2.5 text-destructive" /></button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </GHCard>

      {/* AI Suggestions */}
      <GHCard className="mb-5">
        <h2 className="font-heading text-sm font-bold flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-primary" /> {t("contentCalendar.aiSuggestionsTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {aiTopicSuggestions.map(s => (
            <button key={s.title} onClick={() => { setForm({ ...form, title: s.title, post_type: s.type, content: s.desc }); setShowForm(true); }} className="text-left bg-secondary/50 rounded-xl p-3 hover:bg-secondary transition-colors border border-transparent hover:border-primary/15">
              <div className="text-xs font-bold mb-0.5">{s.title}</div>
              <div className="text-[10px] text-muted-foreground">{s.desc}</div>
            </button>
          ))}
        </div>
      </GHCard>

      {/* New entry form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="font-heading text-lg font-bold mb-4">{t("contentCalendar.newContentTitle")}</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={t("contentCalendar.titlePh")} className="w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none border border-border focus:border-primary" />
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder={t("contentCalendar.contentPh")} rows={4} className="w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none border border-border focus:border-primary resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.post_type} onChange={e => setForm({ ...form, post_type: e.target.value })} className="bg-secondary rounded-xl px-3 py-2 text-sm border border-border">
                  <option value="text">{t("contentCalendar.typeText")}</option>
                  <option value="question">{t("contentCalendar.typeQuestion")}</option>
                  <option value="milestone">{t("contentCalendar.typeMilestone")}</option>
                  <option value="resource">{t("contentCalendar.typeResource")}</option>
                  <option value="announcement">{t("contentCalendar.typeAnnouncement")}</option>
                </select>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="bg-secondary rounded-xl px-3 py-2 text-sm border border-border">
                  <option value="draft">{t("contentCalendar.statusDraft")}</option>
                  <option value="scheduled">{t("contentCalendar.statusScheduled")}</option>
                </select>
              </div>
              <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} className="w-full bg-secondary rounded-xl px-3 py-2 text-sm border border-border" />
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-secondary rounded-xl py-2 text-xs font-bold">{t("contentCalendar.cancel")}</button>
                <button onClick={() => createEntry.mutate({ title: form.title, content: form.content, post_type: form.post_type, scheduled_at: form.scheduled_at || null, status: form.status })} disabled={!form.title} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 text-xs font-bold disabled:opacity-50">{t("contentCalendar.createBtn")}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
