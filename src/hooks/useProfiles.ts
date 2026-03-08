import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export async function fetchProfilesByUserIds(userIds: string[]) {
  if (userIds.length === 0) return [];
  const { data } = await supabase.from("profiles").select("*").in("user_id", userIds);
  return data ?? [];
}

export function useProfiles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profiles"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user!.id)
        .eq("is_public", true)
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}
