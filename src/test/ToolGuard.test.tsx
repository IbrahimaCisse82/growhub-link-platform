import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
// @ts-ignore - screen export works at runtime
import ToolGuard from "@/components/ToolGuard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock useActivatedTools
vi.mock("@/hooks/useActivatedTools", () => ({
  useActivatedTools: () => ({
    isActivated: (key: string) => key === "pitchdeck",
    isLoading: false,
    activateTool: { mutate: vi.fn(), isPending: false },
    activatedTools: [],
    activatedKeys: ["pitchdeck"],
    deactivateTool: { mutate: vi.fn(), isPending: false },
    allTools: [],
  }),
  ALL_TOOLS: [
    { key: "pitchdeck", label: "Pitch Deck", icon: "📊", path: "/pitchdeck", description: "Test", category: "growth" },
    { key: "coaching", label: "Coaching", icon: "🎓", path: "/coaching", description: "Test", category: "growth" },
  ],
  TOOL_CATEGORIES: [],
  ROLE_RECOMMENDED_TOOLS: {},
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("ToolGuard", () => {
  it("renders children when tool is activated", () => {
    render(
      <Wrapper>
        <ToolGuard toolKey="pitchdeck">
          <div>Tool Content</div>
        </ToolGuard>
      </Wrapper>
    );
    expect(screen.getByText("Tool Content")).toBeInTheDocument();
  });

  it("shows activation prompt when tool is not activated", () => {
    render(
      <Wrapper>
        <ToolGuard toolKey="coaching">
          <div>Tool Content</div>
        </ToolGuard>
      </Wrapper>
    );
    expect(screen.getByText(/non activé/)).toBeInTheDocument();
    expect(screen.queryByText("Tool Content")).not.toBeInTheDocument();
  });
});
