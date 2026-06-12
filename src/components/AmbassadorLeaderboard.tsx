import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Award, Globe } from "lucide-react";

const podiumIcons = [Crown, Medal, Award];
const podiumColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];

export function AmbassadorLeaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["ambassador-leaderboard"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("ambassadors")
        .select("id, full_name, country, city, total_conversions, total_referrals, referral_code, status")
        .eq("status", "approved")
        .order("total_conversions", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" /> Top Ambassadeurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucun ambassadeur actif pour le moment. Soyez le premier !
          </p>
        ) : (
          <div className="space-y-1">
            {data.map((a: any, i: number) => {
              const Icon = podiumIcons[i] || Globe;
              return (
                <div key={a.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-6 text-center font-heading text-sm font-extrabold ${i < 3 ? podiumColors[i] : "text-muted-foreground"}`}>
                    {i < 3 ? <Icon className="w-4 h-4 mx-auto" /> : `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{a.full_name}</div>
                    <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {a.city}, {a.country}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-heading text-sm font-extrabold text-primary">{a.total_conversions ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground">filleuls</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
