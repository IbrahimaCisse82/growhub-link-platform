import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const lastDismissed = localStorage.getItem("pwa-dismissed");
      if (!lastDismissed || Date.now() - Number(lastDismissed) > 7 * 24 * 60 * 60 * 1000) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", String(Date.now()));
  };

  if (!showPrompt || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="fixed bottom-[76px] left-3 right-3 lg:left-auto lg:right-7 lg:bottom-7 lg:w-[340px] z-[150] bg-card border-2 border-primary/20 rounded-2xl shadow-2xl p-4"
      >
        <button onClick={handleDismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-sm font-bold mb-1">{t("c2.pwaInstall.title")}</h3>
            <p className="text-[10px] text-muted-foreground mb-3">{t("c2.pwaInstall.description")}</p>
            <button onClick={handleInstall} className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> {t("c2.pwaInstall.installButton")}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
