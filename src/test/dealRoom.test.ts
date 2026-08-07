import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const insertMock = vi.fn().mockResolvedValue({ error: null });
const uploadMock = vi.fn().mockResolvedValue({ error: null });
const maybeSingleMock = vi.fn().mockResolvedValue({ data: null });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: insertMock,
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: maybeSingleMock }),
          order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: () => ({ data: { publicUrl: "https://example.test/doc" } }),
      }),
    },
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

import { useSignNDA, useUploadDocument, useLogAudit, useMyNDA } from "@/hooks/useDealRoom";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

function fakeFile(name: string, size: number) {
  const f = new File(["x"], name, { type: "application/pdf" });
  Object.defineProperty(f, "size", { value: size });
  return f;
}

beforeEach(() => {
  insertMock.mockClear();
  uploadMock.mockClear();
});

describe("useSignNDA", () => {
  it("enregistre la signature avec un hash et le texte du NDA", async () => {
    const { result } = renderHook(() => useSignNDA(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ roomId: "room-1", ndaText: "Accord de non-divulgation" });
    });
    const payload = insertMock.mock.calls[0][0];
    expect(payload.deal_room_id).toBe("room-1");
    expect(payload.user_id).toBe("user-1");
    expect(payload.nda_text).toBe("Accord de non-divulgation");
    expect(payload.signature_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("useUploadDocument", () => {
  it("refuse un fichier au-delà de 25 Mo sans toucher au stockage", async () => {
    const { result } = renderHook(() => useUploadDocument(), { wrapper });
    await expect(
      result.current.mutateAsync({ roomId: "room-1", file: fakeFile("big.pdf", 26214401) })
    ).rejects.toThrow(/25 MB/);
    expect(uploadMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("accepte un fichier valide et journalise l'auteur de l'upload", async () => {
    const { result } = renderHook(() => useUploadDocument(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ roomId: "room-1", file: fakeFile("deck.pdf", 1024) });
    });
    expect(uploadMock).toHaveBeenCalledTimes(1);
    expect(insertMock.mock.calls[0][0]).toMatchObject({
      deal_room_id: "room-1",
      uploaded_by: "user-1",
      file_name: "deck.pdf",
      file_size: 1024,
    });
  });
});

describe("useLogAudit", () => {
  it("trace chaque action documentaire avec son auteur", async () => {
    const { result } = renderHook(() => useLogAudit(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ roomId: "room-1", action: "download", targetId: "doc-1" });
    });
    expect(insertMock.mock.calls[0][0]).toMatchObject({
      deal_room_id: "room-1",
      user_id: "user-1",
      action: "download",
      target_id: "doc-1",
    });
  });
});

describe("useMyNDA", () => {
  it("reste désactivé sans identifiant de deal room", () => {
    const { result } = renderHook(() => useMyNDA(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
