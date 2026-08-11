import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  useDealRoomDocuments, useDealRoomMembers, useDealRoomAudit,
  useMyNDA, useSignNDA, useUploadDocument, useLogAudit,
} from "@/hooks/useDealRoom";
import { Shield, Upload, FileText, Users, History, Lock, Check, ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function DealRoomDetailPage() {
  const { t } = useTranslation();
  const NDA_TEXT = t("dealroom.detail.nda_text");
  const { id } = useParams();
  const { user } = useAuth();
  usePageMeta({ title: t("dealroom.detail.page_meta_title"), description: t("dealroom.detail.page_meta_description") });
  const [tab, setTab] = useState<"docs" | "members" | "audit">("docs");

  const { data: room } = useQuery({
    queryKey: ["deal-room", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await (supabase as any).from("deal_rooms").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: nda } = useMyNDA(id);
  const signNDA = useSignNDA();
  const isOwner = room?.owner_id === user?.id;
  const ndaSigned = isOwner || !!nda;

  const { data: docs = [] } = useDealRoomDocuments(ndaSigned ? id : undefined);
  const { data: members = [] } = useDealRoomMembers(id);
  const { data: audit = [] } = useDealRoomAudit(isOwner ? id : undefined);
  const upload = useUploadDocument();
  const logAudit = useLogAudit();

  if (!room) return (
    <div className="space-y-4" role="status" aria-busy="true" aria-live="polite">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-28 w-full rounded-[20px]" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );

  if (!ndaSigned) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <Link to="/deal-room" className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-4"><ArrowLeft className="w-3 h-3" /> {t("dealroom.detail.back")}</Link>
        <GHCard className="p-6">
          <div className="flex items-center gap-2 mb-3"><Shield className="w-5 h-5 text-primary" /><h2 className="font-heading text-lg font-bold">{t("dealroom.detail.nda_required_title")}</h2></div>
          <p className="text-xs text-muted-foreground mb-3">{t("dealroom.detail.nda_required_desc", { name: room.name })}</p>
          <div className="bg-secondary rounded-xl p-4 text-xs leading-relaxed mb-4 max-h-60 overflow-y-auto">{NDA_TEXT}</div>
          <button onClick={() => signNDA.mutate({ roomId: id!, ndaText: NDA_TEXT }, { onSuccess: () => toast.success(t("dealroom.detail.toast_nda_signed")) })} disabled={signNDA.isPending} className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-bold disabled:opacity-50">{signNDA.isPending ? t("dealroom.detail.signing") : t("dealroom.detail.sign_button")}</button>
        </GHCard>
      </motion.div>
    );
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    upload.mutate({ roomId: id!, file: f }, {
      onSuccess: () => toast.success(t("dealroom.detail.toast_uploaded")),
      onError: (err: any) => toast.error(err.message),
    });
  };

  const onDownload = async (doc: any) => {
    await logAudit.mutateAsync({ roomId: id!, action: "download", targetId: doc.id });
    window.open(doc.file_url, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/deal-room" className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-4"><ArrowLeft className="w-3 h-3" /> {t("dealroom.detail.back")}</Link>

      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="font-heading text-2xl font-extrabold">{room.name}</h1>
          <span className="ml-auto text-[10px] font-mono bg-secondary px-2 py-1 rounded">{t("dealroom.detail.code")}: {room.access_code}</span>
        </div>
        <p className="text-sm text-muted-foreground">{room.description}</p>
      </div>

      <div className="flex gap-2 mb-4 border-b border-border">
        {[
          { k: "docs", label: t("dealroom.detail.tab_documents"), icon: FileText },
          { k: "members", label: t("dealroom.detail.tab_members"), icon: Users },
          ...(isOwner ? [{ k: "audit" as const, label: t("dealroom.detail.tab_audit"), icon: History }] : []),
        ].map(({ k, label, icon: Icon }) => (
          <button key={k} onClick={() => setTab(k as any)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 -mb-px ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "docs" && (
        <div>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-primary/30 rounded-xl p-6 mb-4 cursor-pointer hover:bg-primary/5 transition">
            <Upload className="w-4 h-4 text-primary" />
            <span className="text-sm">{t("dealroom.detail.upload_hint")}</span>
            <input type="file" className="hidden" onChange={onFile} disabled={upload.isPending} />
          </label>
          {docs.length === 0 ? (
            <GHCard className="text-center py-10 text-xs text-muted-foreground">{t("dealroom.detail.no_documents")}</GHCard>
          ) : (
            <div className="space-y-2">
              {docs.map((d: any) => (
                <GHCard key={d.id} className="flex items-center gap-3 p-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.file_name}</p>
                    <p className="text-[10px] text-muted-foreground">{(d.file_size / 1024 / 1024).toFixed(2)} MB · v{d.version}</p>
                  </div>
                  <button onClick={() => onDownload(d)} className="p-2 rounded-lg hover:bg-secondary"><Download className="w-4 h-4" /></button>
                </GHCard>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-2">
          {members.length === 0 ? <GHCard className="text-center py-10 text-xs text-muted-foreground">{t("dealroom.detail.no_members")}</GHCard> :
            members.map((m: any) => (
              <GHCard key={m.id} className="flex items-center gap-3 p-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1"><p className="text-sm font-mono">{m.user_id.slice(0, 8)}…</p><p className="text-[10px] text-muted-foreground">{t("dealroom.detail.role_label", { role: m.role })}</p></div>
                {m.nda_accepted ? <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> {t("dealroom.detail.nda_signed_member")}</span> : <span className="text-[10px] text-amber-500">{t("dealroom.detail.nda_waiting_member")}</span>}
              </GHCard>
            ))}
        </div>
      )}

      {tab === "audit" && isOwner && (
        <div className="space-y-1.5">
          {audit.length === 0 ? <GHCard className="text-center py-10 text-xs text-muted-foreground">{t("dealroom.detail.no_activity")}</GHCard> :
            audit.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-secondary/50">
                <History className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</span>
                <span className="font-bold uppercase text-[10px] text-primary">{a.action}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{a.user_id.slice(0, 8)}…</span>
              </div>
            ))}
        </div>
      )}
    </motion.div>
  );
}
