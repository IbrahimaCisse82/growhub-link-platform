import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useConnections } from "@/hooks/useGrowHub";
import { supabase } from "@/integrations/supabase/client";
import { Send, Search, MessageSquarePlus, ArrowLeft, ShieldOff, Flag, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSearchParams } from "react-router-dom";
import { isOnline, useBlockedUsers, useBlockUser, useReportMessage } from "@/hooks/usePresence";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";


interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerLastSeen: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
}



export default function MessagingPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("nav.messaging"), description: "Échangez avec votre réseau en temps réel." });
  const { user } = useAuth();
  const { data: connections } = useConnections();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const partnerFromUrl = searchParams.get("partner");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(partnerFromUrl);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedPartnerRef = useRef<string | null>(null);
  const { data: blockedRows } = useBlockedUsers();
  const blockedSet = new Set((blockedRows ?? []).map((b: any) => b.blocked_id));
  const blockUser = useBlockUser();
  const reportMessage = useReportMessage();


  // Keep ref in sync
  useEffect(() => {
    selectedPartnerRef.current = selectedPartner;
  }, [selectedPartner]);

  const loadConversations = useCallback(async () => {
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
    let profileMap: Record<string, { name: string; last_seen_at: string | null }> = {};
    if (partnerIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, last_seen_at").in("user_id", partnerIds);
      profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.user_id, { name: p.display_name, last_seen_at: p.last_seen_at }]));
    }

    const convList: Conversation[] = partnerIds.map((pid) => {
      const msgs = convMap.get(pid)!.msgs;
      const last = msgs[0];
      const unread = msgs.filter((m) => m.receiver_id === user.id && !m.is_read).length;
      return {
        partnerId: pid,
        partnerName: profileMap[pid]?.name ?? "Utilisateur",
        partnerLastSeen: profileMap[pid]?.last_seen_at ?? null,
        lastMessage: last.content,
        lastAt: last.created_at,
        unread,
      };
    });

    setConversations(convList);
    setLoading(false);

  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadConversations();

    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          const currentPartner = selectedPartnerRef.current;
          if (currentPartner && (msg.sender_id === currentPartner || msg.receiver_id === currentPartner)) {
            setMessages(prev => [...prev, msg]);
          }
          loadConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadConversations]);

  useEffect(() => {
    if (selectedPartner && user) loadMessages(selectedPartner);
  }, [selectedPartner, user]);

  // Typing indicator — one realtime channel per conversation
  useEffect(() => {
    if (!user || !selectedPartner) return;
    const key = [user.id, selectedPartner].sort().join("-");
    const channel = supabase.channel(`typing-${key}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.from === selectedPartner) {
          setPartnerTyping(true);
          window.clearTimeout(typingTimeoutRef.current ?? undefined);
          typingTimeoutRef.current = window.setTimeout(() => setPartnerTyping(false), 2500);
        }
      })
      .subscribe();
    typingChannelRef.current = channel;
    return () => {
      setPartnerTyping(false);
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
    };
  }, [user, selectedPartner]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (partnerId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);

    await supabase.from("messages").update({ is_read: true }).eq("sender_id", partnerId).eq("receiver_id", user.id);
    loadConversations();
  };

  const broadcastTyping = () => {
    if (!user || !typingChannelRef.current) return;
    typingChannelRef.current.send({ type: "broadcast", event: "typing", payload: { from: user.id } });
  };

  const sendMessage = async () => {
    const content = newMsg.trim();
    if (!content || !selectedPartner || !user) return;
    // Optimistic
    const tmpId = `tmp-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: tmpId, sender_id: user.id, receiver_id: selectedPartner, content,
      created_at: new Date().toISOString(), is_read: false, _optimistic: true,
    }]);
    setNewMsg("");
    const { error, data } = await supabase.from("messages").insert({
      sender_id: user.id, receiver_id: selectedPartner, content,
    }).select().single();
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tmpId));
      toast.error(error.message.includes("are_connected")
        ? "Vous devez être connectés pour échanger"
        : "Envoi impossible");
    } else if (data) {
      setMessages((prev) => prev.map((m) => m.id === tmpId ? data : m));
    }
  };

  const handleBlock = () => {
    if (!selectedPartner) return;
    blockUser.mutate({ userId: selectedPartner }, {
      onSuccess: () => setSelectedPartner(null),
    });
  };



  const startNewChat = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setShowNewChat(false);
    const existing = conversations.find(c => c.partnerId === partnerId);
    if (!existing) setMessages([]);
  };

  const acceptedConnections = connections?.filter(c => c.status === "accepted") ?? [];
  const filteredConversations = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) && !blockedSet.has(c.partnerId)
  );

  const selectedConv = conversations.find((c) => c.partnerId === selectedPartner);

  // Mobile: show either list or chat
  const showList = !isMobile || !selectedPartner;
  const showChat = !isMobile || !!selectedPartner;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Messagerie
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Vos <span className="text-primary">conversations</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
        {/* Conversations list */}
        {showList && (
          <GHCard className="md:col-span-1 p-0 overflow-hidden">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <div className="flex-1 flex items-center bg-secondary/50 rounded-lg px-2.5 gap-2 h-8">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="bg-transparent border-none outline-none text-xs w-full"
                />
              </div>
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>

            {showNewChat && (
              <div className="p-3 border-b border-border bg-primary/5">
                <p className="text-[10px] font-bold text-primary uppercase mb-2">Nouvelle conversation</p>
                {acceptedConnections.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucune connexion disponible</p>
                ) : (
                  acceptedConnections.map(conn => {
                    const profile = (conn as any).partner_profile;
                    if (!profile) return null;
                    return (
                      <button
                        key={conn.id}
                        onClick={() => startNewChat(profile.user_id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 text-xs font-medium transition-colors"
                      >
                        {profile.display_name}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            <div className="overflow-y-auto max-h-[440px]">
              {filteredConversations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation</p>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartner(conv.partnerId)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors",
                      selectedPartner === conv.partnerId && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-xs font-bold truncate flex items-center gap-1.5">
                        {isOnline(conv.partnerLastSeen) && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" aria-label="En ligne" />
                        )}
                        {conv.partnerName}
                      </span>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{conv.unread}</span>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {new Date(conv.lastAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </GHCard>
        )}

        {/* Chat area */}
        {showChat && (
          <GHCard className="md:col-span-2 p-0 flex flex-col overflow-hidden">
            {!selectedPartner ? (
              <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground gap-2">
                <MessageSquarePlus className="w-10 h-10 text-muted-foreground/20" />
                Sélectionnez une conversation ou démarrez-en une nouvelle
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-border font-heading text-sm font-bold flex items-center gap-2">
                  {isMobile && (
                    <button onClick={() => setSelectedPartner(null)} className="text-muted-foreground hover:text-foreground" aria-label="Retour">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className="flex items-center gap-1.5 flex-1">
                    {isOnline(selectedConv?.partnerLastSeen) && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" aria-label="En ligne" />
                    )}
                    {selectedConv?.partnerName ?? "Conversation"}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground text-xs px-2 py-1 rounded-md hover:bg-secondary">⋯</DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleBlock} className="text-destructive">
                        <ShieldOff className="w-3.5 h-3.5 mr-2" /> Bloquer cet utilisateur
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 max-h-[50vh] md:max-h-[380px]">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("group max-w-[80%] md:max-w-[70%]", m.sender_id === user?.id ? "ml-auto" : "mr-auto")}>
                      <div className={cn(
                        "rounded-xl px-3 py-2 text-xs relative",
                        m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary",
                        m._optimistic && "opacity-60"
                      )}>
                        {m.content}
                        {m.sender_id !== user?.id && !String(m.id).startsWith("tmp-") && (
                          <button
                            onClick={() => reportMessage.mutate({ messageId: m.id, reason: "inappropriate" })}
                            className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive"
                            aria-label="Signaler"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                  {partnerTyping && (
                    <div className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
                      <span className="inline-flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:120ms]" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:240ms]" />
                      </span>
                      {selectedConv?.partnerName ?? "Votre contact"} écrit…
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <input
                    value={newMsg}
                    onChange={(e) => { setNewMsg(e.target.value); broadcastTyping(); }}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Votre message..."
                    className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-xs outline-none border border-border focus:border-primary/40"
                  />
                  <button onClick={sendMessage} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:bg-primary-hover transition-colors" aria-label="Envoyer">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

          </GHCard>
        )}
      </div>
    </motion.div>
  );
}

