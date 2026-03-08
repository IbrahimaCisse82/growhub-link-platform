import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useReferralCode, useReferralStats } from "@/hooks/useReferral";
import { toast } from "sonner";
import { Copy, Gift, Users, TrendingUp, Share2, Link2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ReferralPage() {
  usePageMeta({ title: "Parrainage", description: "Invitez vos contacts et gagnez des récompenses." });
  const { user } = useAuth();
  const { data: code, isLoading: loadingCode } = useReferralCode();
  const { data: stats } = useReferralStats();

  const referralLink = code ? `${window.location.origin}/auth?ref=${code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Lien de parrainage copié !");
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Rejoignez GrowHubLink", text: "Rejoignez l'écosystème entrepreneurial !", url: referralLink });
    } else {
      copyLink();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Parrainage
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Invitez, <span className="text-primary">grandissez</span> ensemble
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Partagez votre lien unique et gagnez des badges exclusifs pour chaque parrainage réussi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-5">
        <MetricCard icon="🎁" value={String(stats?.total ?? 0)} label="Invitations envoyées" badge="Total" badgeType="neutral" />
        <MetricCard icon="✅" value={String(stats?.converted ?? 0)} label="Parrainages réussis" badge="Convertis" badgeType="up" />
        <MetricCard icon="⏳" value={String(stats?.pending ?? 0)} label="En attente" badge="Pending" badgeType="neutral" />
      </div>

      {/* Referral Link */}
      <GHCard title="Votre lien de parrainage" className="mb-5">
        {loadingCode ? (
          <div className="h-12 bg-muted/50 rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-mono truncate flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                {referralLink}
              </div>
              <button onClick={copyLink} className="bg-primary text-primary-foreground rounded-xl px-4 py-3 hover:bg-primary-hover transition-colors flex-shrink-0">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={shareLink} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors">
                <Share2 className="w-3.5 h-3.5" /> Partager
              </button>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-[#0A66C2] text-white rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Rejoignez l'écosystème entrepreneurial GrowHubLink !")}&url=${encodeURIComponent(referralLink)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-foreground text-background rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                X / Twitter
              </a>
            </div>
          </div>
        )}
      </GHCard>

      {/* How it works */}
      <GHCard title="Comment ça marche ?">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "1", icon: Share2, title: "Partagez votre lien", desc: "Envoyez votre lien unique à vos contacts via les réseaux sociaux ou par message." },
            { step: "2", icon: Users, title: "Ils s'inscrivent", desc: "Vos contacts créent leur compte gratuitement via votre lien de parrainage." },
            { step: "3", icon: Gift, title: "Gagnez des récompenses", desc: "Débloquez des badges exclusifs et boostez votre score réseau à chaque parrainage." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-heading text-sm font-bold mb-1">{item.title}</div>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </GHCard>
    </motion.div>
  );
}
