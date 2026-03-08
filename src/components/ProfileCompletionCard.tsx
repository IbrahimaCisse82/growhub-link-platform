import { useAuth } from "@/hooks/useAuth";
import { GHCard } from "@/components/ui-custom";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CheckItem {
  key: string;
  label: string;
  ok: boolean;
  action: string;
  route: string;
}

export default function ProfileCompletionCard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const checks: CheckItem[] = [
    { key: "avatar", label: "Photo de profil", ok: !!profile.avatar_url, action: "Ajouter", route: "/profile" },
    { key: "bio", label: "Biographie", ok: !!profile.bio && profile.bio.length > 20, action: "Rédiger", route: "/profile" },
    { key: "headline", label: "Titre professionnel", ok: !!profile.headline, action: "Ajouter", route: "/profile" },
    { key: "skills", label: "3+ compétences", ok: (profile.skills?.length ?? 0) >= 3, action: "Compléter", route: "/profile" },
    { key: "interests", label: "2+ centres d'intérêt", ok: (profile.interests?.length ?? 0) >= 2, action: "Ajouter", route: "/profile" },
    { key: "sector", label: "Secteur d'activité", ok: !!profile.sector, action: "Définir", route: "/profile" },
    { key: "city", label: "Localisation", ok: !!profile.city, action: "Ajouter", route: "/profile" },
    { key: "linkedin", label: "LinkedIn connecté", ok: !!profile.linkedin_url, action: "Connecter", route: "/profile" },
    { key: "website", label: "Site web", ok: !!profile.website_url, action: "Ajouter", route: "/profile" },
    { key: "company", label: "Entreprise", ok: !!profile.company_name, action: "Ajouter", route: "/profile" },
  ];

  const completed = checks.filter(c => c.ok).length;
  const total = checks.length;
  const pct = Math.round((completed / total) * 100);
  const nextAction = checks.find(c => !c.ok);

  if (pct === 100) return null;

  return (
    <GHCard className="relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mb-3 pt-1">
        <div>
          <span className="font-heading text-sm font-bold">Profil complété à {pct}%</span>
          <p className="text-[10px] text-muted-foreground">{completed}/{total} éléments remplis</p>
        </div>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <path className="stroke-secondary" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="stroke-primary" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${pct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-[10px] font-extrabold">{pct}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {checks.map(check => (
          <div key={check.key} className="flex items-center gap-2 py-0.5">
            {check.ok ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
            )}
            <span className={cn("text-[11px]", check.ok ? "text-foreground" : "text-muted-foreground")}>{check.label}</span>
          </div>
        ))}
      </div>

      {nextAction && (
        <button
          onClick={() => navigate(nextAction.route)}
          className="w-full bg-primary/10 text-primary rounded-lg px-3 py-2 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors"
        >
          {nextAction.action} : {nextAction.label} <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </GHCard>
  );
}
