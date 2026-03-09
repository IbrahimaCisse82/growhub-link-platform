import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RoleGuard from "@/components/RoleGuard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock useUserRole
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
    render(
      <Wrapper>
        <RoleGuard allowedRoles={["startup", "investor"]}>
          <div>Protected Content</div>
        </RoleGuard>
      </Wrapper>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows restricted message when role is not allowed", () => {
    render(
      <Wrapper>
        <RoleGuard allowedRoles={["investor"]}>
          <div>Protected Content</div>
        </RoleGuard>
      </Wrapper>
    );
    expect(screen.getByText("Accès restreint")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
