import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// ============ STUDENT ============
export function useStudentProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["student-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("student_career_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("student_career_profiles").upsert({ ...payload, user_id: user!.id }, { onConflict: "user_id" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-profile"] });
      toast.success("Profil carrière mis à jour");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, upsert };
}

export function useStudentApplications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["student-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("student_applications").select("*").eq("student_id", user!.id).order("applied_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("student_applications").insert({ ...payload, student_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-applications"] });
      toast.success("Candidature ajoutée");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, create };
}

// ============ CORPORATE CHALLENGES ============
export function useCorporateChallenges(opts?: { onlyMine?: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["corporate-challenges", opts?.onlyMine, user?.id],
    queryFn: async () => {
      let q = supabase.from("corporate_challenges").select("*").order("created_at", { ascending: false });
      if (opts?.onlyMine && user) q = q.eq("corporate_id", user.id);
      const { data } = await q;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("corporate_challenges").insert({ ...payload, corporate_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["corporate-challenges"] });
      toast.success("Challenge publié");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, create };
}

export function useChallengeSubmissions(challengeId?: string) {
  const qc = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["challenge-submissions", challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      const { data } = await supabase.from("challenge_submissions").select("*").eq("challenge_id", challengeId!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async (payload: { challenge_id: string; pitch: string; attachment_url?: string }) => {
      const { data, error } = await supabase.from("challenge_submissions").insert({ ...payload, startup_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenge-submissions"] });
      toast.success("Candidature envoyée");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, submit };
}

// ============ PRO DEV GOALS ============
export function useProDevGoals() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["pro-dev-goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pro_development_goals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("pro_development_goals").insert({ ...payload, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro-dev-goals"] });
      toast.success("Objectif créé");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: any) => {
      const { data, error } = await supabase.from("pro_development_goals").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pro-dev-goals"] }),
  });

  return { ...query, create, update };
}

// ============ ASPIRATIONAL JOURNEY ============
const DEFAULT_JOURNEY_STEPS = [
  { key: "discover", title: "Découvrir l'écosystème entrepreneurial" },
  { key: "ideation", title: "Trouver une idée qui me passionne" },
  { key: "validate", title: "Valider mon idée auprès du marché" },
  { key: "skills", title: "Identifier mes compétences à développer" },
  { key: "mentor", title: "Trouver un mentor inspirant" },
  { key: "first_pitch", title: "Préparer mon premier pitch" },
  { key: "network", title: "Construire mon réseau" },
  { key: "launch", title: "Lancer mon projet" },
];

export function useAspirationalJourney() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["aspirational-journey", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("aspirational_journey").select("*").eq("user_id", user!.id);
      const existing = data ?? [];
      // Merge with defaults
      return DEFAULT_JOURNEY_STEPS.map(step => {
        const found = existing.find((e: any) => e.step_key === step.key);
        return found ?? { step_key: step.key, step_title: step.title, completed: false, user_id: user!.id };
      });
    },
  });

  const toggle = useMutation({
    mutationFn: async (step: { step_key: string; step_title: string; completed: boolean }) => {
      const { data, error } = await supabase.from("aspirational_journey").upsert({
        user_id: user!.id,
        step_key: step.step_key,
        step_title: step.step_title,
        completed: !step.completed,
        completed_at: !step.completed ? new Date().toISOString() : null,
      }, { onConflict: "user_id,step_key" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aspirational-journey"] }),
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, toggle };
}

// ============ INCUBATOR COHORTS ============
export function useIncubatorCohorts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["incubator-cohorts-v2", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("incubator_cohorts").select("*").eq("incubator_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("incubator_cohorts").insert({ ...payload, incubator_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incubator-cohorts-v2"] });
      toast.success("Cohorte créée");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, create };
}
