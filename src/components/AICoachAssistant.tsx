import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useSSI } from "@/hooks/useSSI";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Bot, Send, Sparkles, X, MessageCircle, Lightbulb, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

function useQuickActions() {
  const { t } = useTranslation();
  return [
    { icon: Target, label: t("uic.aiCoach.quickActions.ssi.label"), prompt: t("uic.aiCoach.quickActions.ssi.prompt") },
    { icon: Users, label: t("uic.aiCoach.quickActions.network.label"), prompt: t("uic.aiCoach.quickActions.network.prompt") },
    { icon: Lightbulb, label: t("uic.aiCoach.quickActions.content.label"), prompt: t("uic.aiCoach.quickActions.content.prompt") },
    { icon: Sparkles, label: t("uic.aiCoach.quickActions.plan.label"), prompt: t("uic.aiCoach.quickActions.plan.prompt") },
  ];
}

function generateCoachResponse(t: (key: string, opts?: any) => string, message: string, profile: any, ssi: any, stats: any): string {
  const name = profile?.display_name?.split(" ")[0] || "";
  const score = ssi?.totalScore ?? 0;
  const connections = stats?.connections ?? 0;
  const posts = stats?.totalPosts ?? 0;
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("ssi") || lowerMsg.includes("score")) {
    const weak: string[] = [];
    if (ssi) {
      if (ssi.profileStrength < 15) weak.push(t("uic.aiCoach.weak.profile"));
      if (ssi.networkQuality < 15) weak.push(t("uic.aiCoach.weak.network"));
      if (ssi.engagement < 15) weak.push(t("uic.aiCoach.weak.engagement"));
      if (ssi.visibility < 15) weak.push(t("uic.aiCoach.weak.visibility"));
    }
    const trend = score < 30 ? t("uic.aiCoach.trend.low") : score < 60 ? t("uic.aiCoach.trend.mid") : t("uic.aiCoach.trend.high");
    const prioritiesBlock = weak.length > 0
      ? `${t("uic.aiCoach.prioritiesTitle")}\n${weak.map((w, i) => `${i + 1}. ${w}`).join("\n")}`
      : t("uic.aiCoach.noPriorities");
    return t("uic.aiCoach.ssiResponse", { name, score, trend, prioritiesBlock });
  }

  if (lowerMsg.includes("réseau") || lowerMsg.includes("network") || lowerMsg.includes("connexion")) {
    return t("uic.aiCoach.networkResponse", { name, connections, target: connections + 15 });
  }

  if (lowerMsg.includes("contenu") || lowerMsg.includes("post") || lowerMsg.includes("idée")) {
    const topics = (t("uic.aiCoach.contentTopics", { returnObjects: true }) as unknown as string[]).join("\n\n");
    const postsNote = posts < 5 ? t("uic.aiCoach.postsNoteLow") : t("uic.aiCoach.postsNoteHigh");
    return t("uic.aiCoach.contentResponse", { name, topics, posts, postsNote });
  }

  if (lowerMsg.includes("plan") || lowerMsg.includes("action") || lowerMsg.includes("semaine")) {
    return t("uic.aiCoach.planResponse", { name });
  }

  return t("uic.aiCoach.defaultResponse", { name });
}

export default function AICoachAssistant() {
  const { t } = useTranslation();
  const quickActions = useQuickActions();
  const { profile } = useAuth();
  const { data: ssi } = useSSI();
  const { data: stats } = useDashboardStats();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    t("uic.aiCoach.greeting", { name: profile?.display_name?.split(" ")[0] || "" }) ? { role: "assistant", content: t("uic.aiCoach.greeting", { name: profile?.display_name?.split(" ")[0] || "" }), timestamp: new Date() } : { role: "assistant", content: "", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const userMsg: Message = { role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      const response = generateCoachResponse(t, msg, profile, ssi, stats);
      setMessages(prev => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[76px] right-4 lg:bottom-7 lg:right-7 z-[190] w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bot className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed inset-x-0 bottom-0 lg:inset-auto lg:bottom-7 lg:right-7 z-[200] w-full lg:w-[360px] lg:max-w-[calc(100vw-24px)] h-[85dvh] lg:h-[520px] lg:max-h-[70vh] bg-card border-t-2 lg:border-2 border-primary/20 lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden rounded-t-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold">{t("uic.aiCoach.title")}</div>
                <div className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {t("uic.aiCoach.status")}</div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line",
                    msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary rounded-bl-md"
                  )}>
                    {msg.content.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {quickActions.map(action => (
                  <button key={action.label} onClick={() => handleSend(action.prompt)} className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/5 border border-primary/15 rounded-lg text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors">
                    <action.icon className="w-3 h-3" /> {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2 items-center bg-secondary rounded-xl px-3 py-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={t("uic.aiCoach.inputPlaceholder")}
                  className="flex-1 bg-transparent outline-none text-xs"
                />
                <button onClick={() => handleSend()} disabled={!input.trim()} className="text-primary disabled:opacity-30">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
