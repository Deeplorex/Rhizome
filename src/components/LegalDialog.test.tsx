import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../lib/i18n";
import { LegalDialog } from "./LegalDialog";

describe("legal dialog", () => {
  beforeEach(() => localStorage.setItem("rhizome-language", "en-US"));
  afterEach(() => localStorage.removeItem("rhizome-language"));

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
