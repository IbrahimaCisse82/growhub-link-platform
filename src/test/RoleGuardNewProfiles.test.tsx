import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import RoleGuard from "@/components/RoleGuard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const roleMock = vi.hoisted(() => ({ value: "etudiant" }));
vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({ role: roleMock.value, isLoading: false }),
}));

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
);

describe("RoleGuard — nouveaux profils", () => {
  beforeEach(() => { roleMock.value = "etudiant"; });

  const cases: Array<[string, string[]]> = [
    ["etudiant", ["etudiant"]],
    ["corporate", ["corporate"]],
    ["professionnel", ["professionnel"]],
    ["aspirationnel", ["aspirationnel"]],
    ["incubateur", ["incubateur"]],
  ];

  cases.forEach(([role, allowed]) => {
    it(`autorise l'accès au profil ${role}`, () => {
      roleMock.value = role;
      const { getByText } = render(
        <Wrapper><RoleGuard allowedRoles={allowed}><div>OK {role}</div></RoleGuard></Wrapper>
      );
      expect(getByText(`OK ${role}`)).toBeInTheDocument();
    });
  });

  it("bloque corporate quand on demande etudiant", () => {
    roleMock.value = "corporate";
    const { getByText, queryByText } = render(
      <Wrapper><RoleGuard allowedRoles={["etudiant"]}><div>Privé</div></RoleGuard></Wrapper>
    );
    expect(getByText("Accès restreint")).toBeInTheDocument();
    expect(queryByText("Privé")).toBeNull();
  });
});
