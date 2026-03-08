import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import MessageTemplates from "@/components/MessageTemplates";

export default function TemplatesPage() {
  usePageMeta({ title: "Templates de messages", description: "Gérez vos modèles de messages pour gagner du temps." });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Templates
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Messages <span className="text-primary">pré-rédigés</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Gagnez du temps avec des modèles personnalisables pour chaque situation.
          </p>
        </div>
      </div>

      <MessageTemplates />
    </motion.div>
  );
}
