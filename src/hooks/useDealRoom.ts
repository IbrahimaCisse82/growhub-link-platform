import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useDealRoomDocuments(roomId?: string) {
  return useQuery({
    queryKey: ["deal-room-docs", roomId],
    enabled: !!roomId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("deal_room_documents")
        .select("*")
        .eq("deal_room_id", roomId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDealRoomMembers(roomId?: string) {
  return useQuery({
    queryKey: ["deal-room-members", roomId],
    enabled: !!roomId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("deal_room_members")
        .select("*")
        .eq("deal_room_id", roomId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDealRoomAudit(roomId?: string) {
  return useQuery({
    queryKey: ["deal-room-audit", roomId],
    enabled: !!roomId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("deal_room_audit_logs")
        .select("*")
        .eq("deal_room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyNDA(roomId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["deal-room-nda", roomId, user?.id],
    enabled: !!roomId && !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("deal_room_ndas")
        .select("*")
        .eq("deal_room_id", roomId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });
}

export function useSignNDA() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: { roomId: string; ndaText: string }) => {
      const hash = await sha256(`${user!.id}:${p.roomId}:${Date.now()}`);
      const { error } = await (supabase as any).from("deal_room_ndas").insert({
        deal_room_id: p.roomId,
        user_id: user!.id,
        signature_hash: hash,
        nda_text: p.ndaText,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["deal-room-nda", v.roomId] });
      qc.invalidateQueries({ queryKey: ["deal-room-docs", v.roomId] });
      qc.invalidateQueries({ queryKey: ["deal-room-audit", v.roomId] });
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: { roomId: string; file: File }) => {
      if (p.file.size > 26214400) throw new Error("Fichier > 25 MB");
      const path = `${p.roomId}/${Date.now()}-${p.file.name}`;
      const { error: upErr } = await supabase.storage.from("deal-room-docs").upload(path, p.file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("deal-room-docs").getPublicUrl(path);
      const { error } = await (supabase as any).from("deal_room_documents").insert({
        deal_room_id: p.roomId,
        uploaded_by: user!.id,
        file_name: p.file.name,
        file_url: urlData.publicUrl,
        file_path: path,
        mime_type: p.file.type,
        file_size: p.file.size,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["deal-room-docs", v.roomId] });
      qc.invalidateQueries({ queryKey: ["deal-room-audit", v.roomId] });
    },
  });
}

export function useLogAudit() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: { roomId: string; action: string; targetId?: string }) => {
      await (supabase as any).from("deal_room_audit_logs").insert({
        deal_room_id: p.roomId,
        user_id: user!.id,
        action: p.action,
        target_id: p.targetId,
      });
    },
  });
}

export function useFundraisingMetrics() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["fundraising-metrics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("fundraising_metrics")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const upsert = useMutation({
    mutationFn: async (vals: Record<string, any>) => {
      const { error } = await (supabase as any).from("fundraising_metrics").upsert(
        { user_id: user!.id, ...vals },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fundraising-metrics"] }),
  });
  return { metrics: query.data, isLoading: query.isLoading, upsert };
}

async function sha256(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}
