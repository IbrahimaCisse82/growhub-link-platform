import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import RoleGuard from "@/components/RoleGuard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({ role: "startup", isLoading: false }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("RoleGuard", () => {
  it("renders children when role is allowed", () => {
    const { getByText } = render(
      <Wrapper>
        <RoleGuard allowedRoles={["startup", "investor"]}>
          <div>Protected Content</div>
        </RoleGuard>
      </Wrapper>
    );
    expect(getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows restricted message when role is not allowed", () => {
    const { getByText, queryByText } = render(
      <Wrapper>
        <RoleGuard allowedRoles={["investor"]}>
          <div>Protected Content</div>
        </RoleGuard>
      </Wrapper>
    );
    expect(getByText("Accès restreint")).toBeInTheDocument();
    expect(queryByText("Protected Content")).toBeNull();
  });
});
