import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import ToolGuard from "@/components/ToolGuard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

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
    const { getByText } = render(
      <Wrapper>
        <ToolGuard toolKey="pitchdeck">
          <div>Tool Content</div>
        </ToolGuard>
      </Wrapper>
    );
    expect(getByText("Tool Content")).toBeInTheDocument();
  });

  it("shows activation prompt when tool is not activated", () => {
    const { getByText, queryByText } = render(
      <Wrapper>
        <ToolGuard toolKey="coaching">
          <div>Tool Content</div>
        </ToolGuard>
      </Wrapper>
    );
    expect(getByText(/non activé/)).toBeInTheDocument();
    expect(queryByText("Tool Content")).toBeNull();
  });
});
