import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GHCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useWarmIntros, useRequestIntro, useRespondIntro } from "@/hooks/useWarmIntros";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Handshake, Check, X, Clock, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function WarmIntrosPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("warmIntros.metaTitle"), description: t("warmIntros.metaDesc") });
  const { user } = useAuth();
  const { data: intros, isLoading } = useWarmIntros();
  const respondIntro = useRespondIntro();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [introMessage, setIntroMessage] = useState("");

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: t("warmIntros.statusPending"), color: "orange", icon: Clock },
    accepted: { label: t("warmIntros.statusAccepted"), color: "green", icon: Check },
    declined: { label: t("warmIntros.statusDeclined"), color: "default", icon: X },
  };

  const myRequests = intros?.filter((i: any) => i.requester_id === user?.id) ?? [];
  const toIntroduce = intros?.filter((i: any) => i.introducer_id === user?.id && i.status === "pending") ?? [];
  const introduced = intros?.filter((i: any) => i.target_id === user?.id) ?? [];

  const handleAccept = (introId: string) => {
    respondIntro.mutate({ introId, status: "accepted", introducerMessage: introMessage }, {
      onSuccess: () => { toast.success(t("warmIntros.acceptedToast")); setRespondingId(null); setIntroMessage(""); },
    });
  };

  const handleDecline = (introId: string) => {
    respondIntro.mutate({ introId, status: "declined" }, {
      onSuccess: () => toast.info(t("warmIntros.declinedToast")),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <Handshake className="w-3.5 h-3.5" /> {t("warmIntros.tag")}
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            {t("warmIntros.h1a")} <span className="text-primary">{t("warmIntros.h1b")}</span>
          </h1>
          <p className="text-foreground/60 text-sm max-w-[460px]">
            {t("warmIntros.subtitle")}
          </p>
        </div>
      </div>

      {/* Pending intros to facilitate */}
      {toIntroduce.length > 0 && (
        <>
          <h3 className="font-heading text-base font-extrabold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-dot" /> {t("warmIntros.toIntroduce")} ({toIntroduce.length})
          </h3>
          <div className="space-y-3 mb-6">
            {toIntroduce.map((intro: any) => (
              <GHCard key={intro.id} className="border-l-4 border-l-primary">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-sm font-bold">{intro.requester_profile?.display_name ?? t("warmIntros.someone")}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-heading text-sm font-bold text-primary">{intro.target_profile?.display_name ?? t("warmIntros.aContact")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">"{intro.message}"</p>
                  </div>
                </div>
                {respondingId === intro.id ? (
                  <div className="space-y-2 border-t border-border pt-3">
                    <input
                      value={introMessage}
                      onChange={e => setIntroMessage(e.target.value)}
                      placeholder={t("warmIntros.introMessagePh")}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(intro.id)} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold flex-1 flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {t("warmIntros.introduceBtn")}
                      </button>
                      <button onClick={() => handleDecline(intro.id)} className="bg-card border border-border rounded-lg px-4 py-2 text-xs font-bold">
                        {t("warmIntros.decline")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setRespondingId(intro.id)} className="w-full bg-primary/10 text-primary rounded-lg py-2 text-xs font-bold hover:bg-primary/20 transition-colors">
                    {t("warmIntros.respond")}
                  </button>
                )}
              </GHCard>
            ))}
          </div>
        </>
      )}

      {/* My requests */}
      <h3 className="font-heading text-base font-extrabold mb-3">{t("warmIntros.myRequests")}</h3>
      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl mb-2" />)
      ) : myRequests.length === 0 ? (
        <GHCard className="text-center py-8 mb-6">
          <Handshake className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t("warmIntros.noRequests")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("warmIntros.noRequestsHint")}</p>
        </GHCard>
      ) : (
        <div className="space-y-2 mb-6">
          {myRequests.map((intro: any) => {
            const sc = statusConfig[intro.status] || statusConfig.pending;
            const Icon = sc.icon;
            return (
              <GHCard key={intro.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Handshake className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-bold">{intro.introducer_profile?.display_name ?? t("warmIntros.contact")}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-bold text-primary">{intro.target_profile?.display_name ?? t("warmIntros.target")}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{intro.message}</p>
                </div>
                <Tag variant={sc.color as any}><Icon className="w-3 h-3 mr-1" /> {sc.label}</Tag>
              </GHCard>
            );
          })}
        </div>
      )}

      {/* Intros about me */}
      {introduced.length > 0 && (
        <>
          <h3 className="font-heading text-base font-extrabold mb-3">{t("warmIntros.receivedIntros")}</h3>
          <div className="space-y-2">
            {introduced.map((intro: any) => {
              const sc = statusConfig[intro.status] || statusConfig.pending;
              return (
                <GHCard key={intro.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Handshake className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm"><span className="font-bold">{intro.requester_profile?.display_name}</span> {t("warmIntros.via")} <span className="font-bold">{intro.introducer_profile?.display_name}</span></div>
                    {intro.introducer_message && <p className="text-[11px] text-muted-foreground">"{intro.introducer_message}"</p>}
                  </div>
                  <Tag variant={sc.color as any}>{sc.label}</Tag>
                </GHCard>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
