import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Eye, FileText, Trash2, ChevronLeft, GripVertical, Save, Copy, EyeOff, Pencil, X, Maximize2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Slide {
  title: string;
  content: string;
}

// ─── Slide Editor Component ─────────────────────────────
function SlideEditor({ deck, onBack }: { deck: any; onBack: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [slides, setSlides] = useState<Slide[]>((deck.slides as Slide[]) ?? []);
  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deckTitle, setDeckTitle] = useState(deck.title);
  const [isPublic, setIsPublic] = useState(deck.is_public ?? false);
  const [presenting, setPresenting] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);

  const activeSlide = slides[activeIdx] ?? null;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("pitch_decks").update({
      title: deckTitle,
      slides: slides as any,
      is_public: isPublic,
    }).eq("id", deck.id);
    setSaving(false);
    if (error) toast.error(t("pitchdeck.toast_save_error"));
    else {
      toast.success(t("pitchdeck.toast_saved"));
      queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
    }
  };

  const updateSlide = (field: keyof Slide, value: string) => {
    const updated = [...slides];
    updated[activeIdx] = { ...updated[activeIdx], [field]: value };
    setSlides(updated);
  };

  const addSlide = () => {
    const newSlide: Slide = { title: t("pitchdeck.editor.new_slide_title"), content: t("pitchdeck.editor.new_slide_content") };
    setSlides([...slides, newSlide]);
    setActiveIdx(slides.length);
  };

  const duplicateSlide = () => {
    if (!activeSlide) return;
    const copy = { ...activeSlide, title: `${activeSlide.title}${t("pitchdeck.editor.duplicate_suffix")}` };
    const updated = [...slides];
    updated.splice(activeIdx + 1, 0, copy);
    setSlides(updated);
    setActiveIdx(activeIdx + 1);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) { toast.error(t("pitchdeck.editor.min_slide_error")); return; }
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    if (activeIdx >= updated.length) setActiveIdx(updated.length - 1);
    else if (activeIdx === idx) setActiveIdx(Math.max(0, idx - 1));
  };

  // Fullscreen presentation
  if (presenting) {
    const slide = slides[presentIdx];
    return (
      <div
        className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Escape") setPresenting(false);
          if (e.key === "ArrowRight" || e.key === " ") setPresentIdx(Math.min(presentIdx + 1, slides.length - 1));
          if (e.key === "ArrowLeft") setPresentIdx(Math.max(presentIdx - 1, 0));
        }}
        ref={(el) => el?.focus()}
      >
        <button onClick={() => setPresenting(false)} className="absolute top-4 right-4 z-10 bg-card/80 rounded-lg p-2 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="absolute top-4 left-4 text-sm text-muted-foreground font-heading font-bold">
          {t("pitchdeck.editor.slide_indicator", { current: presentIdx + 1, total: slides.length })}
        </div>
        <div className="max-w-4xl w-full px-8">
          <div className="bg-card border border-border rounded-2xl p-12 shadow-2xl min-h-[400px] flex flex-col justify-center">
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 text-primary">{slide?.title}</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed whitespace-pre-line">{slide?.content}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button disabled={presentIdx === 0} onClick={() => setPresentIdx(presentIdx - 1)} className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-bold disabled:opacity-30">{t("pitchdeck.editor.previous")}</button>
          <button disabled={presentIdx === slides.length - 1} onClick={() => setPresentIdx(presentIdx + 1)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-30">{t("pitchdeck.editor.next")}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> {t("pitchdeck.editor.back")}
        </button>
        <input
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          className="font-heading text-lg font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none px-1 flex-1 min-w-[200px]"
        />
        <button onClick={() => setIsPublic(!isPublic)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors", isPublic ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-muted-foreground")}>
          {isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {isPublic ? t("pitchdeck.editor.public") : t("pitchdeck.editor.private")}
        </button>
        <button onClick={() => { setPresentIdx(0); setPresenting(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-card border border-border hover:border-primary/35 transition-colors">
          <Maximize2 className="w-3.5 h-3.5" /> {t("pitchdeck.editor.present")}
        </button>
        <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 hover:bg-primary-hover transition-colors">
          <Save className="w-3.5 h-3.5" /> {saving ? t("pitchdeck.editor.saving") : t("pitchdeck.editor.save")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar - slide list */}
        <div className="md:col-span-1 space-y-2">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "group flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-left",
                activeIdx === idx ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/30"
              )}
            >
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-muted-foreground font-bold mb-0.5">{idx + 1}</div>
                <div className="text-xs font-bold truncate">{slide.title}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={addSlide} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
              <Plus className="w-3.5 h-3.5" /> {t("pitchdeck.editor.add_slide")}
            </button>
            <button onClick={duplicateSlide} className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-border text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main editor */}
        <div className="md:col-span-3">
          {activeSlide ? (
            <GHCard className="min-h-[400px]">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground">{t("pitchdeck.editor.slide_count", { current: activeIdx + 1, total: slides.length })}</span>
              </div>
              <input
                value={activeSlide.title}
                onChange={(e) => updateSlide("title", e.target.value)}
                placeholder={t("pitchdeck.editor.placeholder_title")}
                className="w-full font-heading text-2xl font-extrabold bg-transparent outline-none border-b-2 border-border focus:border-primary pb-2 mb-4 transition-colors"
              />
              <textarea
                value={activeSlide.content}
                onChange={(e) => updateSlide("content", e.target.value)}
                placeholder={t("pitchdeck.editor.placeholder_content")}
                className="w-full bg-secondary/30 border border-border rounded-xl p-4 text-sm leading-relaxed resize-none min-h-[250px] focus:outline-none focus:border-primary/40 transition-colors"
              />

              {/* Preview */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("pitchdeck.editor.preview_label")}</p>
                <div className="bg-card border border-border rounded-xl p-6 min-h-[120px]">
                  <h3 className="font-heading text-xl font-extrabold text-primary mb-2">{activeSlide.title}</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-line">{activeSlide.content}</p>
                </div>
              </div>
            </GHCard>
          ) : (
            <GHCard className="text-center py-12">
              <p className="text-sm text-muted-foreground">{t("pitchdeck.editor.select_slide")}</p>
            </GHCard>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function PitchDeckPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("pitchdeck.page_meta_title"), description: t("pitchdeck.page_meta_description") });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingDeck, setEditingDeck] = useState<any | null>(null);

  const templates = [
    { id: "classic", name: t("pitchdeck.templates.classic_name"), description: t("pitchdeck.templates.classic_desc") },
    { id: "storytelling", name: t("pitchdeck.templates.storytelling_name"), description: t("pitchdeck.templates.storytelling_desc") },
    { id: "data-driven", name: t("pitchdeck.templates.data_driven_name"), description: t("pitchdeck.templates.data_driven_desc") },
    { id: "minimal", name: t("pitchdeck.templates.minimal_name"), description: t("pitchdeck.templates.minimal_desc") },
  ];

  const defaultSlides: Slide[] = [
    { title: t("pitchdeck.default_slides.problem_title"), content: t("pitchdeck.default_slides.problem_content") },
    { title: t("pitchdeck.default_slides.solution_title"), content: t("pitchdeck.default_slides.solution_content") },
    { title: t("pitchdeck.default_slides.market_title"), content: t("pitchdeck.default_slides.market_content") },
    { title: t("pitchdeck.default_slides.business_model_title"), content: t("pitchdeck.default_slides.business_model_content") },
    { title: t("pitchdeck.default_slides.traction_title"), content: t("pitchdeck.default_slides.traction_content") },
    { title: t("pitchdeck.default_slides.team_title"), content: t("pitchdeck.default_slides.team_content") },
    { title: t("pitchdeck.default_slides.roadmap_title"), content: t("pitchdeck.default_slides.roadmap_content") },
    { title: t("pitchdeck.default_slides.ask_title"), content: t("pitchdeck.default_slides.ask_content") },
  ];

  const { data: decks, isLoading } = useQuery({
    queryKey: ["pitch-decks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("pitch_decks").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDeck = async (template: string) => {
    if (!user) return;
    const { data, error } = await supabase.from("pitch_decks").insert([{
      user_id: user.id,
      title: t("pitchdeck.default_deck_title", { date: new Date().toLocaleDateString("fr-FR") }),
      template,
      slides: defaultSlides as any,
    }]).select().single();
    if (error) toast.error(t("pitchdeck.toast_creation_error"));
    else {
      toast.success(t("pitchdeck.toast_created"));
      queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
      setEditingDeck(data);
    }
  };

  const deleteDeck = async (id: string) => {
    await supabase.from("pitch_decks").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
    toast.success(t("pitchdeck.toast_deleted"));
  };

  if (editingDeck) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SlideEditor deck={editingDeck} onBack={() => { setEditingDeck(null); queryClient.invalidateQueries({ queryKey: ["pitch-decks"] }); }} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> {t("pitchdeck.badge")}
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("pitchdeck.title_1")} <span className="text-primary">{t("pitchdeck.title_highlight")}</span></h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">{t("pitchdeck.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="📄" value={String(decks?.length ?? 0)} label={t("pitchdeck.metric_decks")} badge={t("pitchdeck.metric_decks_badge")} badgeType="up" />
        <MetricCard icon="👁️" value={String(decks?.reduce((sum, d) => sum + (d.view_count ?? 0), 0) ?? 0)} label={t("pitchdeck.metric_views")} badge="Total" badgeType="up" />
        <MetricCard icon="📊" value={String(decks?.filter((d) => d.is_public).length ?? 0)} label={t("pitchdeck.metric_public")} badge={t("pitchdeck.metric_public_badge")} badgeType="neutral" />
        <MetricCard icon="✨" value="4" label={t("pitchdeck.metric_templates")} badge={t("pitchdeck.metric_templates_badge")} badgeType="neutral" />
      </div>

      <h3 className="font-heading text-sm font-bold mb-3">{t("pitchdeck.create_new_title")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {templates.map((tpl) => (
          <GHCard key={tpl.id} className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => createDeck(tpl.id)}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2"><Plus className="w-5 h-5 text-primary" /></div>
              <div className="font-heading text-xs font-bold">{tpl.name}</div>
              <p className="text-[10px] text-muted-foreground mt-1">{tpl.description}</p>
            </div>
          </GHCard>
        ))}
      </div>

      <h3 className="font-heading text-sm font-bold mb-3">{t("pitchdeck.my_decks_title")}</h3>
      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl mb-2" />)
      ) : !decks || decks.length === 0 ? (
        <GHCard className="text-center py-8">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">{t("pitchdeck.empty_decks")}</p>
        </GHCard>
      ) : (
        decks.map((deck) => (
          <GHCard key={deck.id} className="flex items-center gap-4 mb-2 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setEditingDeck(deck)}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold">{deck.title}</span>
                <Tag variant={deck.is_public ? "green" : "default"}>{deck.is_public ? t("pitchdeck.public") : t("pitchdeck.private")}</Tag>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {t("pitchdeck.deck_meta", { template: deck.template, count: ((deck.slides as any[]) ?? []).length, views: deck.view_count ?? 0, date: new Date(deck.updated_at).toLocaleDateString("fr-FR") })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setEditingDeck(deck); }} className="text-primary hover:text-primary-hover transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </GHCard>
        ))
      )}
    </motion.div>
  );
}
