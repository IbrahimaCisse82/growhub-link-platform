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
import { Briefcase, Users, Star, DollarSign, TrendingUp, ShoppingBag, Clock, ArrowUpRight } from "lucide-react";

function useLeadStatusColors() {
  const { t } = useTranslation();
  return {
    new: { label: t("freelance.statusNew"), classes: "bg-blue-500/10 text-blue-600" },
    contacted: { label: t("freelance.statusContacted"), classes: "bg-amber-500/10 text-amber-600" },
    qualified: { label: t("freelance.statusQualified"), classes: "bg-purple-500/10 text-purple-600" },
    proposal: { label: t("freelance.statusProposal"), classes: "bg-primary/10 text-primary" },
    won: { label: t("freelance.statusWon"), classes: "bg-green-500/10 text-green-600" },
    lost: { label: t("freelance.statusLost"), classes: "bg-destructive/10 text-destructive" },
  } as Record<string, { label: string; classes: string }>;
}

function FreelanceContent() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"services" | "leads" | "bookings">("services");
  const leadStatusColors = useLeadStatusColors();
  const dateLocale = i18n.language.startsWith("fr") ? "fr-FR" : "en-US";

  // My services
  const { data: services = [] } = useQuery({
    queryKey: ["freelance-services", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_services").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // My leads
  const { data: leads = [] } = useQuery({
    queryKey: ["freelance-leads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Bookings received
  const { data: bookings = [] } = useQuery({
    queryKey: ["freelance-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("service_bookings").select("*, marketplace_services(title)").eq("seller_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Buyer profiles
  const buyerIds = [...new Set(bookings.map(b => b.buyer_id))];
  const { data: buyerProfiles = {} } = useQuery({
    queryKey: ["freelance-buyer-profiles", buyerIds],
    enabled: buyerIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, company_name").in("user_id", buyerIds);
      return Object.fromEntries((data ?? []).map(p => [p.user_id, p]));
    },
  });

  const activeServices = services.filter(s => s.is_active);
  const totalBookings = bookings.length;
  const wonLeads = leads.filter(l => l.status === "won").length;
  const avgRating = services.reduce((sum, s) => sum + (s.rating ?? 0), 0) / Math.max(services.length, 1);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🛒" value={String(activeServices.length)} label={t("freelance.activeServices")} badge={t("freelance.marketplaceBadge")} badgeType="up" />
        <MetricCard icon="📋" value={String(leads.length)} label={t("freelance.leads")} badge={t("freelance.pipelineBadge")} badgeType={leads.length > 0 ? "up" : "neutral"} />
        <MetricCard icon="📦" value={String(totalBookings)} label={t("freelance.bookings")} badge={t("freelance.receivedBadge")} badgeType="up" />
        <MetricCard icon="⭐" value={avgRating > 0 ? avgRating.toFixed(1) : "—"} label={t("freelance.avgRating")} badge="/5" badgeType={avgRating > 0 ? "up" : "neutral"} />
      </div>

      <div className="flex gap-1.5 mb-5">
        {([
          { key: "services" as const, label: t("freelance.tabServices"), count: services.length },
          { key: "leads" as const, label: t("freelance.tabLeads"), count: leads.length },
          { key: "bookings" as const, label: t("freelance.tabBookings"), count: bookings.length },
        ]).map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`h-[34px] px-4 rounded-xl text-xs font-bold font-heading border transition-colors ${
              tab === tb.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground/50 hover:border-primary/30"
            }`}>
            {tb.label} ({tb.count})
          </button>
        ))}
      </div>

      {/* Services */}
      {tab === "services" && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <button onClick={() => navigate("/marketplace")} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold">{t("freelance.manageServices")}</button>
          </div>
          {services.length === 0 ? (
            <GHCard className="text-center py-10">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">{t("freelance.emptyServices")}</p>
              <button onClick={() => navigate("/marketplace")} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-xs font-bold">{t("freelance.publishService")}</button>
            </GHCard>
          ) : services.map(s => (
            <GHCard key={s.id} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.is_active ? "bg-primary/10" : "bg-secondary"}`}>
                <Briefcase className={`w-4 h-4 ${s.is_active ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold">{s.title}</div>
                <div className="text-[11px] text-muted-foreground">{s.category} · {t("freelance.reservationsCount", { count: s.total_bookings ?? 0 })}</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-sm font-bold text-primary">
                  {s.price_type === "free" ? t("freelance.free") : s.price_type === "negotiable" ? t("freelance.negotiable") : `${s.price ?? 0}€${s.price_type === "hourly" ? "/h" : ""}`}
                </div>
                {s.rating ? <div className="text-[10px] text-muted-foreground">⭐ {Number(s.rating).toFixed(1)}</div> : null}
              </div>
              <Tag variant={s.is_active ? "green" : "default"}>{s.is_active ? t("freelance.active") : t("freelance.inactive")}</Tag>
            </GHCard>
          ))}
        </div>
      )}

      {/* Leads */}
      {tab === "leads" && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <button onClick={() => navigate("/marketing")} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold">{t("freelance.manageLeads")}</button>
          </div>
          {leads.length === 0 ? (
            <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">{t("freelance.emptyLeads")}</p></GHCard>
          ) : leads.map(l => {
            const st = leadStatusColors[l.status] ?? leadStatusColors.new;
            return (
              <GHCard key={l.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-heading text-xs font-extrabold text-primary">
                  {l.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-heading text-sm font-bold">{l.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {l.company && <span>{l.company} · </span>}
                    {l.source && <span>{t("freelance.source", { source: l.source })}</span>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.classes}`}>{st.label}</span>
              </GHCard>
            );
          })}
        </div>
      )}

      {/* Bookings */}
      {tab === "bookings" && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">{t("freelance.emptyBookings")}</p></GHCard>
          ) : bookings.map((b: any) => {
            const buyer = (buyerProfiles as any)[b.buyer_id];
            return (
              <GHCard key={b.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-heading text-sm font-bold">{buyer?.display_name ?? t("freelance.client")}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {b.marketplace_services?.title ?? t("freelance.service")} · {new Date(b.created_at).toLocaleDateString(dateLocale)}
                  </div>
                  {b.message && <div className="text-[10px] text-foreground/60 mt-1 italic">"{b.message}"</div>}
                </div>
                <Tag variant={b.status === "completed" ? "green" : b.status === "cancelled" ? "red" : "default"}>
                  {b.status === "completed" ? t("freelance.bookingCompleted") : b.status === "cancelled" ? t("freelance.bookingCancelled") : b.status === "pending" ? t("freelance.bookingPending") : b.status}
                </Tag>
              </GHCard>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function FreelancePipelinePage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("freelance.metaTitle"), description: t("freelance.metaDesc") });

  return (
    <RoleGuard allowedRoles={["freelance", "expert"]} fallbackMessage={t("freelance.roleGuardMessage")}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <Briefcase className="w-3 h-3" /> {t("freelance.tag")}
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("freelance.h1a")} <span className="text-primary">{t("freelance.h1mid")}</span> {t("freelance.h1b")}</h1>
            <p className="text-sm text-muted-foreground max-w-lg">{t("freelance.subtitle")}</p>
          </div>
        </div>
        <FreelanceContent />
      </motion.div>
    </RoleGuard>
  );
}
