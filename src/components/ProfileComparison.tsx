import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles, useConnections } from "@/hooks/useGrowHub";
import { GHCard, Tag } from "@/components/ui-custom";
import { GitCompare, X, Search, TrendingUp, Users, Star, Target, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileData {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  company_name: string | null;
  sector: string | null;
  network_score: number | null;
  profile_views: number | null;
  skills: string[] | null;
  interests: string[] | null;
  city: string | null;
  company_stage: string | null;
}

function MetricRow({ label, icon: Icon, values, highlight }: { label: string; icon: typeof TrendingUp; values: (string | number | null)[]; highlight?: "max" | "none" }) {
  const numValues = values.map(v => (typeof v === "number" ? v : 0));
  const maxVal = Math.max(...numValues);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 w-32 flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      {values.map((val, i) => (
        <div key={i} className={cn(
          "flex-1 text-center text-sm font-bold",
          highlight === "max" && typeof val === "number" && val === maxVal && val > 0 && "text-primary"
        )}>
          {val ?? "—"}
        </div>
      ))}
    </div>
  );
}

export default function ProfileComparison() {
  const { user, profile: myProfile } = useAuth();
  const { data: profiles } = useProfiles();
  const { data: connections } = useConnections();
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  const acceptedConnections = connections?.filter(c => c.status === "accepted") ?? [];
  const connectedUserIds = new Set(acceptedConnections.map(c => c.requester_id === user?.id ? c.receiver_id : c.requester_id));

  const availableProfiles = (profiles ?? []).filter(p => 
    connectedUserIds.has(p.user_id) &&
    !selectedProfiles.includes(p.user_id) &&
    (!searchTerm || p.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const compareProfiles: ProfileData[] = [
    myProfile as unknown as ProfileData,
    ...selectedProfiles.map(id => (profiles ?? []).find(p => p.user_id === id) as unknown as ProfileData).filter(Boolean),
  ].filter(Boolean);

  const commonSkills = (a: string[] | null, b: string[] | null) => {
    if (!a || !b) return 0;
    return a.filter(s => b.includes(s)).length;
  };

  return (
    <GHCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-sm font-bold">Comparer les profils</h3>
        </div>
        {selectedProfiles.length < 2 && (
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 hover:bg-primary/20 transition-colors"
          >
            + Ajouter un profil
          </button>
        )}
      </div>

      {showSelector && (
        <div className="mb-4 border border-border rounded-xl p-3 bg-secondary/30">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 h-9 mb-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher une connexion..."
              className="bg-transparent outline-none text-xs w-full"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {availableProfiles.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">Aucune connexion trouvée</p>
            ) : (
              availableProfiles.slice(0, 8).map(p => (
                <button
                  key={p.user_id}
                  onClick={() => {
                    setSelectedProfiles(prev => [...prev, p.user_id]);
                    setShowSelector(false);
                    setSearchTerm("");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/60 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                    {p.display_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-medium">{p.display_name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.company_name ?? ""}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {compareProfiles.length > 1 ? (
        <div>
          {/* Headers */}
          <div className="flex items-center gap-3 pb-3 border-b border-border mb-1">
            <div className="w-32 flex-shrink-0" />
            {compareProfiles.map((p, i) => (
              <div key={p.user_id} className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {p.display_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold mt-1 truncate">{i === 0 ? "Vous" : p.display_name}</div>
                {i > 0 && (
                  <button
                    onClick={() => setSelectedProfiles(prev => prev.filter(id => id !== p.user_id))}
                    className="text-[10px] text-muted-foreground hover:text-destructive mt-0.5"
                  >
                    <X className="w-3 h-3 inline" /> Retirer
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Metrics */}
          <MetricRow label="Score réseau" icon={TrendingUp} values={compareProfiles.map(p => p.network_score)} highlight="max" />
          <MetricRow label="Vues profil" icon={Users} values={compareProfiles.map(p => p.profile_views)} highlight="max" />
          <MetricRow label="Compétences" icon={Star} values={compareProfiles.map(p => p.skills?.length ?? 0)} highlight="max" />
          <MetricRow label="Secteur" icon={Briefcase} values={compareProfiles.map(p => p.sector)} />
          <MetricRow label="Stade" icon={Target} values={compareProfiles.map(p => p.company_stage)} />
          <MetricRow label="Ville" icon={Users} values={compareProfiles.map(p => p.city)} />

          {/* Skills overlap */}
          {compareProfiles.length === 2 && (
            <div className="mt-4 p-3 bg-secondary/30 rounded-xl">
              <p className="text-xs font-bold mb-2">
                Compétences communes : {commonSkills(compareProfiles[0].skills, compareProfiles[1].skills)}
              </p>
              <div className="flex flex-wrap gap-1">
                {(compareProfiles[0].skills ?? []).filter(s => compareProfiles[1].skills?.includes(s)).map(s => (
                  <Tag key={s} variant="green">{s}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          Ajoutez un profil de votre réseau pour commencer la comparaison
        </p>
      )}
    </GHCard>
  );
}
