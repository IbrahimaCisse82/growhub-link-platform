import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { GHCard, Tag } from "@/components/ui-custom";
import { Target, UserPlus, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSendConnection } from "@/hooks/useGrowHub";
import { toast } from "sonner";

const intentSuggestions = {
  looking_for: [
    "CTO / Co-fondateur technique", "Investisseur Série A", "Mentor expérimenté",
    "Designer UI/UX", "Développeur Full-Stack", "Expert Marketing",
    "Business Developer", "Partenaire commercial", "Conseiller juridique",
    "Community Manager", "Expert Fundraising", "Coach Business",
  ],
  offering: [
    "Expertise technique", "Mentorat stratégique", "Investissement",
    "Design & Branding", "Développement logiciel", "Conseil marketing",
    "Réseau d'investisseurs", "Accompagnement startup", "Expertise juridique",
    "Growth Hacking", "Conseil en levée de fonds", "Formation & Coaching",
  ],
};

interface IntentMatch {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  company_name: string | null;
  sector: string | null;
  headline: string | null;
  looking_for: string[];
  offering: string[];
  match_reason: string;
  match_type: "they_offer_what_you_need" | "they_need_what_you_offer" | "mutual";
}

export function IntentEditor() {
  const { user, profile, refetchProfile } = useAuth();
  const [lookingFor, setLookingFor] = useState<string[]>((profile as any)?.looking_for ?? []);
  const [offering, setOffering] = useState<string[]>((profile as any)?.offering ?? []);
  const [headline, setHeadline] = useState((profile as any)?.headline ?? "");
  const [saving, setSaving] = useState(false);
  const [customLooking, setCustomLooking] = useState("");
  const [customOffering, setCustomOffering] = useState("");

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const addCustom = (list: string[], setList: (v: string[]) => void, value: string, reset: () => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      reset();
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      looking_for: lookingFor,
      offering: offering,
      headline: headline || null,
    } as any).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erreur");
    else { toast.success("Intents mis à jour !"); await refetchProfile(); }
  };

  return (
    <GHCard title="🎯 Ce que vous cherchez & offrez" className="mb-5">
      <p className="text-xs text-muted-foreground mb-4">
        Déclarez vos besoins et vos offres pour être matché avec les bonnes personnes.
      </p>

      <div className="mb-4">
        <label className="text-xs font-bold text-foreground/70 mb-1 block">Headline (phrase d'accroche)</label>
        <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Ex: CEO @ TechStartup — Cherche CTO pour révolutionner la FinTech"
          className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-bold text-primary flex items-center gap-1 mb-2">
            <Target className="w-3 h-3" /> Je cherche...
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {intentSuggestions.looking_for.map(item => (
              <button key={item} onClick={() => toggleItem(lookingFor, setLookingFor, item)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${lookingFor.includes(item) ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:border-primary/20"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input value={customLooking} onChange={e => setCustomLooking(e.target.value)} placeholder="Autre..."
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary/40"
              onKeyDown={e => e.key === "Enter" && addCustom(lookingFor, setLookingFor, customLooking, () => setCustomLooking(""))} />
            <button onClick={() => addCustom(lookingFor, setLookingFor, customLooking, () => setCustomLooking(""))}
              className="text-xs text-primary font-bold px-2">+</button>
          </div>
          {lookingFor.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {lookingFor.map(item => (
                <Tag key={item} variant="green">
                  {item}
                  <button onClick={() => setLookingFor(lookingFor.filter(i => i !== item))} className="ml-1 text-primary/60 hover:text-primary">×</button>
                </Tag>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-blue-500 flex items-center gap-1 mb-2">
            <Sparkles className="w-3 h-3" /> J'offre...
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {intentSuggestions.offering.map(item => (
              <button key={item} onClick={() => toggleItem(offering, setOffering, item)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${offering.includes(item) ? "bg-blue-500/10 text-blue-500 border-blue-500/30" : "border-border text-muted-foreground hover:border-blue-500/20"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input value={customOffering} onChange={e => setCustomOffering(e.target.value)} placeholder="Autre..."
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary/40"
              onKeyDown={e => e.key === "Enter" && addCustom(offering, setOffering, customOffering, () => setCustomOffering(""))} />
            <button onClick={() => addCustom(offering, setOffering, customOffering, () => setCustomOffering(""))}
              className="text-xs text-blue-500 font-bold px-2">+</button>
          </div>
          {offering.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {offering.map(item => (
                <Tag key={item} variant="blue">
                  {item}
                  <button onClick={() => setOffering(offering.filter(i => i !== item))} className="ml-1 text-blue-500/60 hover:text-blue-500">×</button>
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold disabled:opacity-50 hover:bg-primary-hover transition-all">
        {saving ? "Sauvegarde..." : "Sauvegarder mes intents"}
      </button>
    </GHCard>
  );
}

export function IntentMatchResults() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const sendConnection = useSendConnection();

  const myLookingFor = (profile as any)?.looking_for ?? [];
  const myOffering = (profile as any)?.offering ?? [];

  const { data: matches, isLoading } = useQuery({
    queryKey: ["intent-matches", user?.id, myLookingFor.join(","), myOffering.join(",")],
    enabled: !!user && (myLookingFor.length > 0 || myOffering.length > 0),
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, company_name, sector, headline, looking_for, offering")
        .neq("user_id", user!.id)
        .eq("is_public", true)
        .limit(50);
      if (error) throw error;

      const { data: connections } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);
      const connectedIds = new Set((connections ?? []).flatMap(c => [c.requester_id, c.receiver_id]).filter(id => id !== user!.id));

      const results: IntentMatch[] = [];
      for (const p of (profiles ?? [])) {
        if (connectedIds.has(p.user_id)) continue;
        const theirOffering = (p.offering as string[]) ?? [];
        const theirLookingFor = (p.looking_for as string[]) ?? [];

        const theyOfferWhatINeed = myLookingFor.filter((l: string) =>
          theirOffering.some((o: string) => o.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(o.toLowerCase()))
        );
        const theyNeedWhatIOffer = myOffering.filter((o: string) =>
          theirLookingFor.some((l: string) => l.toLowerCase().includes(o.toLowerCase()) || o.toLowerCase().includes(l.toLowerCase()))
        );

        if (theyOfferWhatINeed.length > 0 || theyNeedWhatIOffer.length > 0) {
          const matchType = theyOfferWhatINeed.length > 0 && theyNeedWhatIOffer.length > 0
            ? "mutual" : theyOfferWhatINeed.length > 0 ? "they_offer_what_you_need" : "they_need_what_you_offer";

          const reasons = [
            ...theyOfferWhatINeed.map((r: string) => `Offre: ${r}`),
            ...theyNeedWhatIOffer.map((r: string) => `Cherche: ${r}`),
          ];

          results.push({
            ...(p as any),
            looking_for: theirLookingFor,
            offering: theirOffering,
            match_reason: reasons.join(" · "),
            match_type: matchType,
          });
        }
      }

      return results.sort((a, b) => {
        const priority = { mutual: 3, they_offer_what_you_need: 2, they_need_what_you_offer: 1 };
        return priority[b.match_type] - priority[a.match_type];
      }).slice(0, 12);
    },
    staleTime: 60_000,
  });

  if (myLookingFor.length === 0 && myOffering.length === 0) return null;

  const matchTypeLabels = {
    mutual: { label: "Match mutuel", color: "text-primary", bg: "bg-primary/10" },
    they_offer_what_you_need: { label: "Offre ce que vous cherchez", color: "text-emerald-600", bg: "bg-emerald-500/10" },
    they_need_what_you_offer: { label: "Cherche ce que vous offrez", color: "text-blue-600", bg: "bg-blue-500/10" },
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-heading text-lg font-bold">Matchs basés sur vos intents</h2>
        <Tag variant="green">{matches?.length ?? 0} matchs</Tag>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-4 text-center">Recherche de matchs...</div>
      ) : !matches || matches.length === 0 ? (
        <GHCard className="text-center py-6">
          <p className="text-sm text-muted-foreground">Aucun match trouvé. Ajoutez plus d'intents pour améliorer vos résultats.</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {matches.map(match => {
            const config = matchTypeLabels[match.match_type];
            return (
              <GHCard key={match.user_id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/profile/${match.user_id}`)}>
                <div className="flex items-start gap-3 mb-2">
                  {match.avatar_url ? (
                    <img src={match.avatar_url} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {match.display_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-heading text-sm font-bold truncate">{match.display_name}</div>
                    {match.headline ? (
                      <p className="text-[10px] text-muted-foreground truncate">{match.headline}</p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground truncate">{[match.company_name, match.sector].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </div>
                <div className={`${config.bg} ${config.color} text-[10px] font-bold rounded-lg px-2 py-1 mb-2 inline-block`}>
                  ✦ {config.label}
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3">{match.match_reason}</p>
                <button onClick={e => {
                  e.stopPropagation();
                  sendConnection.mutate({ receiverId: match.user_id }, {
                    onSuccess: () => toast.success("Demande envoyée !"),
                    onError: () => toast.error("Erreur"),
                  });
                }} className="w-full bg-primary/10 text-primary rounded-lg py-2 text-xs font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Se connecter
                </button>
              </GHCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
