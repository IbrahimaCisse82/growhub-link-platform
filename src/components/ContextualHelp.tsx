import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface HelpItem {
  question: string;
  answer: string;
}

interface ContextualHelpProps {
  title: string;
  items: HelpItem[];
}

export default function ContextualHelp({ title, items, open: controlledOpen, onOpenChange }: ContextualHelpProps & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <>
      {/* Help panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[400] bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-3 bottom-[76px] lg:inset-auto lg:bottom-20 lg:right-6 z-[401] w-auto lg:w-[340px] max-h-[70vh] bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <h3 className="font-heading text-sm font-extrabold">{title}</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[55vh] p-3">
                {items.map((item, i) => (
                  <div key={i} className="mb-1">
                    <button
                      onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform",
                          expandedIndex === i && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-3 pb-3 text-sm text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-border">
                <p className="text-[11px] text-muted-foreground text-center">
                  {t("c2.contextualHelp.footer")} <span className="text-primary font-medium">support@growhublink.com</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Pre-built help configs per page — resolved via i18next translations (namespace c2.contextualHelp.configs)
import i18n from "@/i18n";
export function getHelpConfig(key: string): { title: string; items: { question: string; answer: string }[] } {
  return i18n.t(`c2.contextualHelp.configs.${key}`, { returnObjects: true }) as any;
}

export const helpConfigs = new Proxy({} as Record<string, { title: string; items: { question: string; answer: string }[] }>, {
  get: (_target, prop: string) => getHelpConfig(prop),
});
