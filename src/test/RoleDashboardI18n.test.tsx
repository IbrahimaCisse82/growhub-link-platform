import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import i18n from "@/i18n";
import { RoleQuickActions, RoleGuidance } from "@/components/RoleDashboard";

const roles = [
  "startup",
  "mentor",
  "investor",
  "expert",
  "freelance",
  "incubateur",
  "etudiant",
  "aspirationnel",
  "professionnel",
  "corporate",
];

function renderWith(node: React.ReactNode) {
  return render(<BrowserRouter>{node}</BrowserRouter>);
}

function assertNoRawKeys(text: string) {
  expect(text).not.toMatch(/c3\.roleDashboard/);
  expect(text).not.toMatch(/\[object Object\]/);
}

describe("RoleDashboard i18n", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("fr");
  });

  for (const role of roles) {
    it(`affiche les actions rapides traduites pour ${role}`, () => {
      const { container, unmount } = renderWith(<RoleQuickActions role={role} />);
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(4);
      buttons.forEach((b) => {
        const text = (b.textContent ?? "").trim();
        expect(text.length).toBeGreaterThan(2);
        assertNoRawKeys(text);
      });
      unmount();
    });

    it(`affiche les conseils traduits pour ${role}`, () => {
      const { container, unmount } = renderWith(<RoleGuidance role={role} />);
      const text = container.textContent ?? "";
      assertNoRawKeys(text);
      const items = container.querySelectorAll("button");
      expect(items.length).toBe(4);
      items.forEach((b) => expect((b.textContent ?? "").trim().length).toBeGreaterThan(3));
      unmount();
    });
  }

  it("bascule les conseils en anglais", async () => {
    await i18n.changeLanguage("en");
    const { container, unmount } = renderWith(<RoleGuidance role="startup" />);
    const text = container.textContent ?? "";
    assertNoRawKeys(text);
    expect(text).toContain("Next steps");
    unmount();
    await i18n.changeLanguage("fr");
  });
});
