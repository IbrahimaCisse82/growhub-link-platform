import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GHCard, Tag } from "@/components/ui-custom";
import { FileText, Plus, Copy, Trash2, Sparkles, X } from "lucide-react";

const defaultTemplates = [
  { title: "Demande de connexion", content: "Bonjour {{nom}}, j'ai vu votre profil et je pense que nous pourrions avoir des synergies intéressantes. Seriez-vous disponible pour un échange ?", category: "networking" },
  { title: "Demande d'intro chaleureuse", content: "Bonjour {{nom}}, j'aimerais beaucoup être mis en relation avec {{cible}}. Pensez-vous pouvoir faciliter cette introduction ?", category: "intro" },
  { title: "Suivi après événement", content: "Bonjour {{nom}}, ravi de vous avoir rencontré lors de {{événement}}. J'aimerais poursuivre notre conversation. Quand seriez-vous disponible ?", category: "followup" },
  { title: "Proposition de collaboration", content: "Bonjour {{nom}}, je travaille sur {{projet}} et je pense que votre expertise en {{domaine}} pourrait être complémentaire. Discutons-en ?", category: "collaboration" },
];

const categoryLabels: Record<string, string> = {
  networking: "Networking",
  intro: "Introduction",
  followup: "Suivi",
  collaboration: "Collaboration",
  other: "Autre",
};

interface Props {
  onSelect?: (content: string) => void;
  compact?: boolean;
}

export default function MessageTemplates({ onSelect, compact = false }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "networking" });

  const { data: templates } = useQuery({
    queryKey: ["message-templates", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("message_templates")
        .select("*")
        .order("usage_count", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("message_templates").insert({
        user_id: user!.id,
        title: form.title,
        content: form.content,
        category: form.category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template créé !");
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      setForm({ title: "", content: "", category: "networking" });
      setShowCreate(false);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("message_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template supprimé");
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
    },
  });

  const useTemplate = (content: string) => {
    if (onSelect) {
      onSelect(content);
    } else {
      navigator.clipboard.writeText(content);
      toast.success("Copié dans le presse-papier !");
    }
  };

  const allTemplates = [
    ...(templates ?? []),
    ...defaultTemplates.filter(d => !(templates ?? []).some((t: any) => t.title === d.title)),
  ];

  if (compact) {
    return (
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] font-bold text-primary uppercase">Templates</span>
          <button onClick={() => setShowCreate(!showCreate)} className="text-primary hover:text-primary-hover">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {allTemplates.map((t: any, i: number) => (
          <button
            key={t.id ?? i}
            onClick={() => useTemplate(t.content)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{t.title}</span>
              <Tag>{categoryLabels[t.category] ?? t.category}</Tag>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{t.content}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <GHCard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-heading text-sm font-bold">Templates de messages</span>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Créer
        </button>
      </div>

      {showCreate && (
        <div className="bg-secondary/30 rounded-lg p-3 mb-3 border border-border">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Nom du template"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:border-primary/40" />
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Contenu (utilisez {{variable}} pour les champs dynamiques)" rows={3}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:border-primary/40 resize-none" />
          <div className="flex items-center justify-between">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="bg-card border border-border rounded-lg px-2 py-1 text-xs">
              {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="px-3 py-1 text-xs font-bold border border-border rounded-lg">Annuler</button>
              <button onClick={() => createTemplate.mutate()} disabled={!form.title || !form.content}
                className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-lg disabled:opacity-50">Sauver</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {allTemplates.map((t: any, i: number) => (
          <div key={t.id ?? i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 group transition-colors">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading text-xs font-bold">{t.title}</span>
                <Tag>{categoryLabels[t.category] ?? t.category}</Tag>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.content}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => useTemplate(t.content)} className="p-1 hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
              {t.id && t.user_id === user?.id && (
                <button onClick={() => deleteTemplate.mutate(t.id)} className="p-1 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </GHCard>
  );
}
