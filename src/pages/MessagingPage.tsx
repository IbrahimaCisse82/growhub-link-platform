import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Send, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export default function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (!selectedPartner || !user) return;
    loadMessages(selectedPartner);
  }, [selectedPartner]);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const convMap = new Map<string, { msgs: typeof data }>();
    data.forEach((m) => {
      const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!convMap.has(partnerId)) convMap.set(partnerId, { msgs: [] });
      convMap.get(partnerId)!.msgs.push(m);
    });

    const partnerIds = [...convMap.keys()];
    let profileMap: Record<string, string> = {};
    if (partnerIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", partnerIds);
      profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name]));
    }

    const convList: Conversation[] = partnerIds.map((pid) => {
      const msgs = convMap.get(pid)!.msgs;
      const last = msgs[0];
      const unread = msgs.filter((m) => m.receiver_id === user.id && !m.is_read).length;
      return {
        partnerId: pid,
        partnerName: profileMap[pid] ?? "Utilisateur",
        lastMessage: last.content,
        lastAt: last.created_at,
        unread,
      };
    });

    setConversations(convList);
    setLoading(false);
  };

  const loadMessages = async (partnerId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);

    // Mark as read
    await supabase.from("messages").update({ is_read: true }).eq("sender_id", partnerId).eq("receiver_id", user.id);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedPartner || !user) return;
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedPartner,
      content: newMsg.trim(),
    });
    setNewMsg("");
    loadMessages(selectedPartner);
  };

  const selectedConv = conversations.find((c) => c.partnerId === selectedPartner);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Messagerie
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Vos <span className="text-primary">conversations</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 min-h-[500px]">
        {/* Conversations list */}
        <GHCard className="col-span-1 p-0 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center bg-secondary/50 rounded-lg px-2.5 gap-2 h-8">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Rechercher..." className="bg-transparent border-none outline-none text-xs w-full" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[440px]">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => setSelectedPartner(conv.partnerId)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors",
                    selectedPartner === conv.partnerId && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-bold truncate">{conv.partnerName}</span>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{conv.unread}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </GHCard>

        {/* Chat area */}
        <GHCard className="col-span-2 p-0 flex flex-col overflow-hidden">
          {!selectedPartner ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Sélectionnez une conversation
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border font-heading text-sm font-bold">
                {selectedConv?.partnerName}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[380px]">
                {messages.map((m) => (
                  <div key={m.id} className={cn("max-w-[70%]", m.sender_id === user?.id ? "ml-auto" : "mr-auto")}>
                    <div className={cn(
                      "rounded-xl px-3 py-2 text-xs",
                      m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}>
                      {m.content}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Votre message..."
                  className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-xs outline-none border border-border focus:border-primary/40"
                />
                <button onClick={sendMessage} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:bg-primary-hover transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </GHCard>
      </div>
    </motion.div>
  );
}
