import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useUserRole() {
  const { user } = useAuth();

  const { data: role = "startup", isLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (!data || data.length === 0) return "startup";
      // If user has multiple roles, prefer the non-startup one (e.g. mentor, investor)
      const nonDefault = data.find((r) => r.role !== "startup");
      return nonDefault?.role ?? data[0].role ?? "startup";
    },
  });

  return { role, isLoading };
}
