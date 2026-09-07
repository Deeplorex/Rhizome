import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../lib/i18n";
import { LegalDialog } from "./LegalDialog";

describe("legal dialog", () => {
  beforeEach(() => localStorage.setItem("rhizome-language", "en-US"));
  afterEach(() => localStorage.removeItem("rhizome-language"));

  it("describes business use and the no-sale restriction in both languages", () => {
    for (const language of ["en-US", "zh-CN"]) {
      localStorage.setItem("rhizome-language", language);
      const { unmount } = render(
        <I18nProvider>
          <LegalDialog initialDocument="terms" onClose={vi.fn()} />
        </I18nProvider>,
      );
      const license = screen.getByText(/Rhizome No-Sale License 1.0/);
      expect(license).toHaveTextContent(
        language === "en-US" ? "work and internal business" : "工作和内部业务",
      );
      expect(license).toHaveTextContent(
        language === "en-US"
          ? "charging for downloads requires written permission"
          : "不得销售原版或修改版",
      );
      unmount();
    }
  });

  it("shows the English document selected by the current language", () => {
    render(
      <I18nProvider>
        <LegalDialog initialDocument="privacy" onClose={vi.fn()} />
      </I18nProvider>,
    );

    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/does not collect, upload, sell/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Third-party open-source licenses" }),
    ).toBeInTheDocument();
  });
});
