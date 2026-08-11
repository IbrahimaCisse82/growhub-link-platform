import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GHCard, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";
import { Shield, Plus, Lock, Users, FileText, Eye, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DealRoomPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("dealroom.page_meta_title"), description: t("dealroom.page_meta_description") });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [, setSelectedRoom] = useState<string | null>(null);

  const { data: rooms = [] } = useQuery({
    queryKey: ["deal-rooms", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any).from("deal_rooms").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: memberRooms = [] } = useQuery({
    queryKey: ["deal-room-memberships", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any).from("deal_room_members").select("*, deal_rooms(*)").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const createRoom = useMutation({
    mutationFn: async (room: any) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await (supabase as any).from("deal_rooms").insert({ ...room, owner_id: user!.id, access_code: code });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["deal-rooms"] }); toast.success(t("dealroom.toast_created")); setShowForm(false); setForm({ name: "", description: "" }); },
  });

  const activeRooms = rooms.filter((r: any) => r.status === "active").length;
  const ndaSigned = rooms.filter((r: any) => r.nda_signed).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5"><Shield className="w-3 h-3" /> {t("dealroom.badge")}</div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("dealroom.title_1")} <span className="text-primary">{t("dealroom.title_highlight")}</span> {t("dealroom.title_2")}</h1>
          <p className="text-sm text-muted-foreground max-w-lg">{t("dealroom.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🔒" value={String(activeRooms)} label={t("dealroom.metric_active_rooms")} badge={t("dealroom.metric_active_rooms_badge")} badgeType="up" />
        <MetricCard icon="📝" value={String(ndaSigned)} label={t("dealroom.metric_nda_signed")} badge={t("dealroom.metric_nda_signed_badge")} badgeType="up" />
        <MetricCard icon="👥" value={String(memberRooms.length)} label={t("dealroom.metric_invitations")} badge={t("dealroom.metric_invitations_badge")} badgeType="neutral" />
        <MetricCard icon="📄" value="0" label={t("dealroom.metric_documents")} badge={t("dealroom.metric_documents_badge")} badgeType="neutral" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-lg font-bold">{t("dealroom.my_rooms")}</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold"><Plus className="w-3.5 h-3.5" /> {t("dealroom.new_room")}</button>
      </div>

      {rooms.length === 0 && memberRooms.length === 0 ? (
        <GHCard className="text-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">{t("dealroom.empty_title")}</p>
          <p className="text-xs text-muted-foreground">{t("dealroom.empty_subtitle")}</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room: any) => (
            <GHCard key={room.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/deal-room/${room.id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${room.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>{room.status === "active" ? t("dealroom.status_active") : t("dealroom.status_archived")}</span>
              </div>
              <h3 className="font-heading text-sm font-bold mb-1">{room.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{room.description || t("dealroom.no_description")}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 0 {t("dealroom.docs_count")}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 0 {t("dealroom.members_count")}</span>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{t("dealroom.code")}: {room.access_code}</div>
              </div>
            </GHCard>
          ))}
          {memberRooms.map((m: any) => (
            <GHCard key={m.id} className="border-l-4 border-l-blue-500/50">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold text-blue-500">{t("dealroom.invited")}</span>
              </div>
              <h3 className="font-heading text-sm font-bold mb-1">{(m as any).deal_rooms?.name ?? t("dealroom.default_room_name")}</h3>
              <div className="flex items-center gap-2 mt-2">
                {!m.nda_accepted && <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1"><Shield className="w-3 h-3" /> {t("dealroom.nda_pending")}</span>}
                {m.nda_accepted && <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> {t("dealroom.nda_accepted")}</span>}
              </div>
            </GHCard>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> {t("dealroom.modal_title")}</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("dealroom.placeholder_name")} className="w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none border border-border focus:border-primary" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("dealroom.placeholder_description")} rows={3} className="w-full bg-secondary rounded-xl px-3 py-2 text-sm outline-none border border-border focus:border-primary resize-none" />
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-[10px] text-amber-600 font-medium">{t("dealroom.code_notice")}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-secondary rounded-xl py-2 text-xs font-bold">{t("dealroom.cancel")}</button>
                <button onClick={() => createRoom.mutate({ name: form.name, description: form.description })} disabled={!form.name} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 text-xs font-bold disabled:opacity-50">{t("dealroom.create")}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
