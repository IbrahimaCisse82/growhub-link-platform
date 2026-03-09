import { describe, it, expect } from "vitest";
import { ALL_TOOLS, TOOL_CATEGORIES, ROLE_RECOMMENDED_TOOLS } from "@/hooks/useActivatedTools";

describe("useActivatedTools - Tool definitions", () => {
  it("all tools have unique keys", () => {
    const keys = ALL_TOOLS.map(t => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all tools have valid paths starting with /", () => {
    ALL_TOOLS.forEach(tool => {
      expect(tool.path).toMatch(/^\//);
    });
  });

  it("all tools have a valid category", () => {
    const validCategories = TOOL_CATEGORIES.filter(c => c.key !== "all" && c.key !== "recommended").map(c => c.key);
    ALL_TOOLS.forEach(tool => {
      expect(validCategories).toContain(tool.category);
    });
  });

  it("role recommendations reference valid tool keys", () => {
    const validKeys = new Set(ALL_TOOLS.map(t => t.key));
    Object.entries(ROLE_RECOMMENDED_TOOLS).forEach(([role, toolKeys]) => {
      toolKeys.forEach(key => {
        expect(validKeys.has(key)).toBe(true);
      });
    });
  });

  it("all roles have recommendations", () => {
    const expectedRoles = ["startup", "mentor", "investor", "expert", "freelance", "incubateur", "etudiant", "aspirationnel", "professionnel", "corporate"];
    expectedRoles.forEach(role => {
      expect(ROLE_RECOMMENDED_TOOLS[role]).toBeDefined();
      expect(ROLE_RECOMMENDED_TOOLS[role].length).toBeGreaterThan(0);
    });
  });
});
