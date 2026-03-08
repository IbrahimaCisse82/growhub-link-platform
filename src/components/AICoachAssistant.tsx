import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useSSI } from "@/hooks/useSSI";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Bot, Send, Sparkles, X, MessageCircle, Lightbulb, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: Target, label: "Optimiser mon SSI", prompt: "Comment puis-je améliorer mon score SSI rapidement ?" },
  { icon: Users, label: "Stratégie réseau", prompt: "Quelle stratégie de networking me recommandes-tu cette semaine ?" },
  { icon: Lightbulb, label: "Idées de contenu", prompt: "Suggère-moi 3 idées de posts pour engager ma communauté." },
  { icon: Sparkles, label: "Plan d'action", prompt: "Crée-moi un plan d'action networking pour les 7 prochains jours." },
];

function generateCoachResponse(message: string, profile: any, ssi: any, stats: any): string {
  const name = profile?.display_name?.split(" ")[0] || "là";
  const score = ssi?.totalScore ?? 0;
  const connections = stats?.connections ?? 0;
  const posts = stats?.totalPosts ?? 0;
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("ssi") || lowerMsg.includes("score")) {
    const weak = [];
    if (ssi) {
      if (ssi.profileStrength < 15) weak.push("compléter votre profil (photo, bio, compétences, LinkedIn)");
      if (ssi.networkQuality < 15) weak.push("élargir votre réseau avec des connexions ciblées");
      if (ssi.engagement < 15) weak.push("publier régulièrement et interagir avec les posts");
      if (ssi.visibility < 15) weak.push("participer à des événements et sessions de coaching");
    }
    return `${name}, votre SSI est à **${score}/100**. ${score < 30 ? "Il y a un bon potentiel d'amélioration !" : score < 60 ? "Vous êtes sur la bonne voie !" : "Excellent travail !"}\n\n${weak.length > 0 ? `🎯 **Axes prioritaires :**\n${weak.map((w, i) => `${i + 1}. ${w}`).join("\n")}` : "Continuez à maintenir votre activité régulière !"}\n\n💡 **Astuce rapide** : Connectez-vous chaque jour pour maintenir votre streak et gagner des points bonus.`;
  }

  if (lowerMsg.includes("réseau") || lowerMsg.includes("network") || lowerMsg.includes("connexion")) {
    return `${name}, avec **${connections} connexions** actuelles, voici ma stratégie recommandée :\n\n🔥 **Cette semaine :**\n1. Envoyez **3-5 demandes ciblées** par jour à des profils complémentaires\n2. Personnalisez chaque message avec un point commun (secteur, intérêt)\n3. Répondez aux **intentions actives** dans l'onglet matching\n\n📊 **Objectif** : Atteindre ${connections + 15} connexions d'ici vendredi\n\n🎯 **Pro tip** : Les profils qui publient du contenu ont 3x plus de chances d'accepter une connexion.`;
  }

  if (lowerMsg.includes("contenu") || lowerMsg.includes("post") || lowerMsg.includes("idée")) {
    const topics = [
      "📌 **Retour d'expérience** : Partagez un défi récent et comment vous l'avez surmonté",
      "🔍 **Question ouverte** : Demandez l'avis de votre réseau sur une tendance du secteur",
      "💡 **Conseil actionnable** : Partagez un outil ou une méthode qui a fait la différence",
      "📊 **Milestone** : Célébrez un petit accomplissement et remerciez votre réseau",
      "🤝 **Mise en lumière** : Recommandez publiquement un contact qui vous a impressionné",
    ];
    return `${name}, voici **5 idées de contenu** adaptées à votre profil :\n\n${topics.join("\n\n")}\n\n📅 **Fréquence idéale** : 2-3 posts par semaine, de préférence mardi et jeudi matin.\n\n💡 Vous avez publié **${posts} posts** jusqu'ici. ${posts < 5 ? "Commencer par 1 post cette semaine serait un excellent début !" : "Continuez cette dynamique !"}`;
  }

  if (lowerMsg.includes("plan") || lowerMsg.includes("action") || lowerMsg.includes("semaine")) {
    return `${name}, voici votre **Plan d'Action de la Semaine** 🚀\n\n**📅 Lundi** : Complétez/mettez à jour votre profil + publiez vos intentions\n**📅 Mardi** : Publiez un post + envoyez 5 demandes de connexion\n**📅 Mercredi** : Commentez 10 posts de votre réseau\n**📅 Jeudi** : Participez à un événement ou challenge communautaire\n**📅 Vendredi** : Publiez un retour d'expérience + envoyez 3 recommandations\n\n🎯 **KPIs à suivre** :\n- SSI : Viser +5 points cette semaine\n- Connexions : +10 minimum\n- Posts : 2 publications minimum\n- Streak : Ne pas casser la chaîne !\n\n💪 Vous en êtes capable !`;
  }

  return `${name}, je suis votre coach IA GrowHub ! 🤖\n\nJe peux vous aider avec :\n- 📊 **Analyse SSI** et recommandations personnalisées\n- 🤝 **Stratégie de networking** adaptée à votre profil\n- ✍️ **Idées de contenu** pour engager votre réseau\n- 📋 **Plans d'action** hebdomadaires\n\nQue souhaitez-vous travailler aujourd'hui ?`;
}

export default function AICoachAssistant() {
  const { profile } = useAuth();
  const { data: ssi } = useSSI();
  const { data: stats } = useDashboardStats();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Bonjour ${profile?.display_name?.split(" ")[0] || ""} ! 👋 Je suis votre coach IA. Comment puis-je vous aider aujourd'hui ?`, timestamp: new Date() },
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
      const response = generateCoachResponse(msg, profile, ssi, stats);
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
                <div className="font-heading text-sm font-bold">Coach IA GrowHub</div>
                <div className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> En ligne</div>
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
                  placeholder="Posez votre question..."
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
