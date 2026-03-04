import { motion } from "framer-motion";
import { GHCard, ProgressBar, Tag, SectionHeader, MetricCard } from "@/components/ui-custom";

export default function GenericPage({ pageId, title, subtitle, description }: {
  pageId: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            {subtitle}
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5" dangerouslySetInnerHTML={{ __html: title }} />
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-[18px]">
        <MetricCard icon="📊" value="—" label="En construction" badge="Bientôt" badgeType="neutral" />
        <MetricCard icon="🚀" value="—" label="En construction" badge="Bientôt" badgeType="neutral" />
        <MetricCard icon="💡" value="—" label="En construction" badge="Bientôt" badgeType="neutral" />
        <MetricCard icon="🎯" value="—" label="En construction" badge="Bientôt" badgeType="neutral" />
      </div>

      <GHCard className="text-center py-12">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="font-heading text-xl font-extrabold mb-2">Page en construction</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Cette section est en cours de développement. Revenez bientôt pour découvrir toutes les fonctionnalités !
        </p>
      </GHCard>
    </motion.div>
  );
}
