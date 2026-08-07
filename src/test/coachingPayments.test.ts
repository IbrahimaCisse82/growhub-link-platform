import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const insertMock = vi.fn().mockResolvedValue({ error: null });
const orderMock = vi.fn();
const eqMock = vi.fn(() => ({ order: orderMock }));
const selectMock = vi.fn(() => ({ eq: eqMock, order: orderMock }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ insert: insertMock, select: selectMock }),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "learner-1" } }),
}));

import { useCreateCoachingPayment, useCoachEarnings, useOpenDispute } from "@/hooks/useCoachingPayments";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  insertMock.mockClear();
  orderMock.mockReset();
});

describe("useCreateCoachingPayment", () => {
  it("enregistre le paiement avec l'apprenant authentifié et laisse la commission au trigger", async () => {
    const { result } = renderHook(() => useCreateCoachingPayment(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        sessionId: "sess-1",
        coachId: "coach-1",
        grossAmount: 20000,
        provider: "wave",
      });
    });
    expect(insertMock).toHaveBeenCalledTimes(1);
    const payload = insertMock.mock.calls[0][0];
    // Ownership must come from the authenticated user, never from the caller
    expect(payload.learner_id).toBe("learner-1");
    expect(payload.gross_amount).toBe(20000);
    expect(payload.currency).toBe("XOF");
    // Commission is computed server-side (15%) — the client must not set it
    expect(payload.commission_amount).toBe(0);
    expect(payload.net_amount).toBe(0);
  });

  it("propage les erreurs serveur (RLS, contraintes)", async () => {
    insertMock.mockResolvedValueOnce({ error: new Error("row-level security") });
    const { result } = renderHook(() => useCreateCoachingPayment(), { wrapper });
    await expect(
      result.current.mutateAsync({ sessionId: "s", coachId: "c", grossAmount: 1, provider: "wave" })
    ).rejects.toThrow(/row-level security/);
  });
});

describe("useCoachEarnings", () => {
  it("n'agrège que les paiements réglés et respecte la répartition 85/15", async () => {
    orderMock.mockResolvedValue({
      data: [
        { gross_amount: 20000, commission_amount: 3000, net_amount: 17000, status: "paid", currency: "XOF" },
        { gross_amount: 10000, commission_amount: 1500, net_amount: 8500, status: "paid", currency: "XOF" },
        { gross_amount: 50000, commission_amount: 7500, net_amount: 42500, status: "pending", currency: "XOF" },
      ],
      error: null,
    });
    const { result } = renderHook(() => useCoachEarnings("coach-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const d = result.current.data!;
    expect(d.totalGross).toBe(30000);
    expect(d.totalCommission).toBe(4500);
    expect(d.totalNet).toBe(25500);
    expect(d.totalCommission / d.totalGross).toBeCloseTo(0.15, 5);
    expect(d.totalNet / d.totalGross).toBeCloseTo(0.85, 5);
    expect(d.currency).toBe("XOF");
  });

  it("reste désactivé sans coachId", () => {
    const { result } = renderHook(() => useCoachEarnings(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useOpenDispute", () => {
  it("ouvre un litige attribué à l'utilisateur connecté", async () => {
    const { result } = renderHook(() => useOpenDispute(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ sessionId: "sess-9", reason: "no_show" });
    });
    expect(insertMock.mock.calls[0][0]).toMatchObject({
      session_id: "sess-9",
      opened_by: "learner-1",
      reason: "no_show",
    });
  });
});
