import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfilesByUserIds } from "@/hooks/useProfiles";
import { useConnections } from "@/hooks/useConnections";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  FolderKanban, Plus, Users, MessageSquare, CheckCircle2, Circle, Clock,
  Send, ChevronLeft, Trash2, UserPlus, ListTodo, ArrowRight, Paperclip, FileText, Download
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function useSpaces() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["spaces", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: memberOf } = await supabase.from("space_members").select("space_id").eq("user_id", user!.id);
      const spaceIds = (memberOf ?? []).map(m => m.space_id);
      if (spaceIds.length === 0) {
        // Also check owned spaces
        const { data: owned } = await supabase.from("spaces").select("*").eq("created_by", user!.id);
        return owned ?? [];
      }
      const { data } = await supabase.from("spaces").select("*").or(`id.in.(${spaceIds.join(",")}),created_by.eq.${user!.id}`);
      return data ?? [];
    },
  });
}

function useSpaceMembers(spaceId: string | null) {
  return useQuery({
    queryKey: ["space-members", spaceId],
    enabled: !!spaceId,
    queryFn: async () => {
      const { data } = await supabase.from("space_members").select("*").eq("space_id", spaceId!);
      const userIds = (data ?? []).map(m => m.user_id);
      const profiles = await fetchProfilesByUserIds(userIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      return (data ?? []).map(m => ({ ...m, profile: profileMap[m.user_id] }));
    },
  });
}

function useSpaceTasks(spaceId: string | null) {
  return useQuery({
    queryKey: ["space-tasks", spaceId],
    enabled: !!spaceId,
    queryFn: async () => {
      const { data } = await supabase.from("space_tasks").select("*").eq("space_id", spaceId!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

function useSpaceMessages(spaceId: string | null) {
  return useQuery({
    queryKey: ["space-messages", spaceId],
    enabled: !!spaceId,
    queryFn: async () => {
      const { data } = await supabase.from("space_messages").select("*").eq("space_id", spaceId!).order("created_at", { ascending: true }).limit(100);
      const userIds = [...new Set((data ?? []).map(m => m.user_id))];
      const profiles = await fetchProfilesByUserIds(userIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      return (data ?? []).map(m => ({ ...m, profile: profileMap[m.user_id] }));
    },
  });
}

export default function SpacesPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("spaces.metaTitle"), description: t("spaces.metaDesc") });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: spaces, isLoading } = useSpaces();
  const { data: connections } = useConnections();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"tasks" | "chat">("tasks");

  // Create space
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const acceptedConnections = (connections ?? []).filter(c => c.status === "accepted");

  const createSpace = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("spaces").insert({
        name: newName,
        description: newDesc || null,
        created_by: user!.id,
      }).select().single();
      if (error) throw error;

      // Add creator as member
      await supabase.from("space_members").insert({ space_id: data.id, user_id: user!.id, role: "owner" });
      // Add selected members
      for (const uid of selectedMembers) {
        await supabase.from("space_members").insert({ space_id: data.id, user_id: uid });
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success(t("spaces.spaceCreatedToast"));
      setShowCreate(false);
      setNewName(""); setNewDesc(""); setSelectedMembers([]);
      setSelectedSpace(data.id);
    },
    onError: () => toast.error(t("spaces.errorToast")),
  });

  const space = spaces?.find(s => s.id === selectedSpace);

  if (selectedSpace && space) {
    return (
      <SpaceDetail
        space={space}
        onBack={() => setSelectedSpace(null)}
        tab={tab}
        setTab={setTab}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <FolderKanban className="w-3.5 h-3.5" /> {t("spaces.tag")}
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            {t("spaces.h1a")} <span className="text-primary">{t("spaces.h1b")}</span>
          </h1>
          <p className="text-foreground/60 text-sm max-w-[460px]">
            {t("spaces.subtitle")}
          </p>
        </div>
      </div>

      {/* Create */}
      {!showCreate ? (
        <button onClick={() => setShowCreate(true)}
          className="w-full bg-card border-2 border-dashed border-border rounded-2xl p-6 flex items-center justify-center gap-3 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all mb-5 cursor-pointer">
          <Plus className="w-5 h-5" />
          <span className="font-heading text-sm font-bold">{t("spaces.createSpace")}</span>
        </button>
      ) : (
        <GHCard title={t("spaces.createDialogTitle")} className="mb-5">
          <div className="space-y-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t("spaces.namePh")}
              className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder={t("spaces.descPh")}
              className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none min-h-[60px] focus:outline-none focus:border-primary/40" />
            
            {acceptedConnections.length > 0 && (
              <div>
                <label className="text-xs font-bold text-foreground/70 mb-2 block">{t("spaces.inviteMembers")}</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {acceptedConnections.map(c => {
                    const p = c.partner_profile;
                    if (!p) return null;
                    const partnerId = c.requester_id === user?.id ? c.receiver_id : c.requester_id;
                    const selected = selectedMembers.includes(partnerId);
                    return (
                      <button key={partnerId}
                        onClick={() => setSelectedMembers(s => selected ? s.filter(id => id !== partnerId) : [...s, partnerId])}
                        className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                          selected ? "bg-primary/10 border-primary text-primary" : "bg-secondary border-border text-foreground/70 hover:border-primary/30"
                        )}>
                        {p.display_name}
                        {selected && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => createSpace.mutate()} disabled={!newName.trim()}
                className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold disabled:opacity-50 hover:bg-primary-hover transition-all">
                {t("spaces.create")}
              </button>
              <button onClick={() => setShowCreate(false)}
                className="bg-secondary text-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold">{t("spaces.cancel")}</button>
            </div>
          </div>
        </GHCard>
      )}

      {/* Spaces list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : !spaces?.length ? (
        <GHCard className="text-center py-10">
          <FolderKanban className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("spaces.noSpaces")}</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaces.map(s => (
            <div key={s.id} onClick={() => setSelectedSpace(s.id)}
              className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-heading text-sm font-bold mb-1">{s.name}</h3>
              {s.description && <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
              <div className="text-[10px] text-muted-foreground mt-3">
                {t("spaces.createdOn")} {new Date(s.created_at).toLocaleDateString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SpaceDetail({ space, onBack, tab, setTab }: { space: any; onBack: () => void; tab: "tasks" | "chat"; setTab: (t: "tasks" | "chat") => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: members } = useSpaceMembers(space.id);
  const { data: tasks } = useSpaceTasks(space.id);
  const { data: messages } = useSpaceMessages(space.id);
  const [newTask, setNewTask] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Realtime messages & tasks
  useEffect(() => {
    const channel = supabase
      .channel(`space-${space.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "space_messages", filter: `space_id=eq.${space.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["space-messages", space.id] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "space_tasks", filter: `space_id=eq.${space.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["space-tasks", space.id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [space.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addTask = useMutation({
    mutationFn: async () => {
      await supabase.from("space_tasks").insert({ space_id: space.id, title: newTask, created_by: user!.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-tasks", space.id] });
      setNewTask("");
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "done" ? "todo" : "done";
      await supabase.from("space_tasks").update({ status: newStatus }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["space-tasks", space.id] }),
  });

  const sendMsg = useMutation({
    mutationFn: async () => {
      await supabase.from("space_messages").insert({
        space_id: space.id, user_id: user!.id, content: newMsg,
        parent_id: replyTo?.id ?? null,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-messages", space.id] });
      setNewMsg("");
      setReplyTo(null);
    },
  });

  const todoTasks = (tasks ?? []).filter(t => t.status !== "done");
  const doneTasks = (tasks ?? []).filter(t => t.status === "done");

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="bg-secondary rounded-xl p-2.5 hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-lg font-bold">{space.name}</h1>
          {space.description && <p className="text-xs text-muted-foreground">{space.description}</p>}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" /> {members?.length ?? 0}
        </div>
      </div>

      {/* Members */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {members?.map(m => (
          <div key={m.user_id} className="flex items-center gap-1.5 bg-secondary rounded-full px-2.5 py-1 flex-shrink-0">
            {m.profile?.avatar_url ? (
              <img src={m.profile.avatar_url} className="w-5 h-5 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[8px] font-bold text-primary">
                {(m.profile?.display_name ?? "?").substring(0, 1)}
              </div>
            )}
            <span className="text-[10px] font-medium">{m.profile?.display_name ?? t("spaces.member")}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-4">
        <button onClick={() => setTab("tasks")}
          className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all",
            tab === "tasks" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
          <ListTodo className="w-3.5 h-3.5" /> {t("spaces.tasksTab")} ({(tasks ?? []).length})
        </button>
        <button onClick={() => setTab("chat")}
          className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all",
            tab === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
          <MessageSquare className="w-3.5 h-3.5" /> {t("spaces.chatTab")} ({(messages ?? []).length})
        </button>
      </div>

      {tab === "tasks" ? (
        <div>
          {/* Add task */}
          <div className="flex gap-2 mb-4">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder={t("spaces.newTaskPh")}
              onKeyDown={e => e.key === "Enter" && newTask.trim() && addTask.mutate()}
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            <select
              onChange={e => {
                if (!newTask.trim()) return;
                // Quick assign via select
              }}
              className="bg-secondary/50 border border-border rounded-xl px-2 text-[10px] hidden sm:block"
              title="Assigner à"
            >
              <option value="">{t("spaces.assign")}</option>
              {members?.map(m => (
                <option key={m.user_id} value={m.user_id}>{m.profile?.display_name ?? t("spaces.member")}</option>
              ))}
            </select>
            <button onClick={() => newTask.trim() && addTask.mutate()}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold hover:bg-primary-hover transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Todo */}
          {todoTasks.length > 0 && (
            <div className="space-y-2 mb-4">
              {todoTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 group">
                  <button onClick={() => toggleTask.mutate({ id: task.id, status: task.status })}>
                    <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                  <span className="text-sm flex-1">{task.title}</span>
                  {task.priority === "high" && <Tag variant="red">{t("spaces.urgent")}</Tag>}
                </div>
              ))}
            </div>
          )}

          {/* Done */}
          {doneTasks.length > 0 && (
            <div>
              <div className="text-xs font-bold text-muted-foreground mb-2">{t("spaces.doneTasks")} ({doneTasks.length})</div>
              <div className="space-y-1.5">
                {doneTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-2.5">
                    <button onClick={() => toggleTask.mutate({ id: task.id, status: task.status })}>
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </button>
                    <span className="text-sm text-muted-foreground line-through">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!todoTasks.length && !doneTasks.length && (
            <div className="text-center py-10 text-muted-foreground text-sm">{t("spaces.noTasks")}</div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-[60vh] md:h-[400px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
            {(() => {
              const all = messages ?? [];
              const roots = all.filter((m: any) => !m.parent_id);
              const childrenByParent: Record<string, any[]> = {};
              all.forEach((m: any) => {
                if (m.parent_id) (childrenByParent[m.parent_id] ||= []).push(m);
              });
              const renderBubble = (m: any, isReply = false) => {
                const isMe = m.user_id === user?.id;
                return (
                  <div key={m.id} className={cn("flex gap-2 group", isMe && "flex-row-reverse", isReply && "ml-8")}>
                    {!isMe && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary flex-shrink-0">
                        {(m.profile?.display_name ?? "?").substring(0, 1)}
                      </div>
                    )}
                    <div className={cn("max-w-[75%]", isMe ? "text-right" : "")}>
                      {!isMe && <div className="text-[9px] font-bold text-muted-foreground mb-0.5">{m.profile?.display_name}</div>}
                      <div className={cn("rounded-2xl px-3 py-2 text-xs inline-block",
                        isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md")}>
                        {m.content}
                      </div>
                      <div className="text-[8px] text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {!isReply && (
                          <button onClick={() => setReplyTo({ id: m.id, preview: m.content.slice(0, 40) })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary font-semibold">
                            {t("spaces.reply")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              };
              return roots.map((m: any) => (
                <div key={m.id} className="space-y-2">
                  {renderBubble(m)}
                  {(childrenByParent[m.id] ?? []).map((r: any) => renderBubble(r, true))}
                </div>
              ));
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply banner */}
          {replyTo && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 mb-2 text-[10px]">
              <span className="text-muted-foreground truncate">{t("spaces.replyTo")} <span className="text-foreground font-semibold">"{replyTo.preview}"</span></span>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-destructive font-bold">×</button>
            </div>
          )}

          {/* Input with file sharing */}
          <div className="flex gap-2">
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder={replyTo ? t("spaces.replyPh") : t("spaces.messagePh")}
              onKeyDown={e => e.key === "Enter" && newMsg.trim() && sendMsg.mutate()}
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.doc,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif";
                input.onchange = async (e: any) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  const ext = file.name.split(".").pop();
                  const path = `spaces/${space.id}/${Date.now()}.${ext}`;
                  const { error } = await supabase.storage.from("post-media").upload(path, file);
                  if (error) { toast.error(t("spaces.uploadError")); return; }
                  const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(path);
                  await supabase.from("space_messages").insert({
                    space_id: space.id,
                    user_id: user.id,
                    content: `📎 [${file.name}](${urlData.publicUrl})`
                  });
                  queryClient.invalidateQueries({ queryKey: ["space-messages", space.id] });
                  toast.success(t("spaces.fileSharedToast"));
                };
                input.click();
              }}
              className="bg-secondary border border-border rounded-xl px-3 py-2.5 hover:bg-secondary/80 transition-all"
              title={t("spaces.shareFile")}
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => newMsg.trim() && sendMsg.mutate()}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 hover:bg-primary-hover transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
