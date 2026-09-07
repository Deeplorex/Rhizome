import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

describe("sidebar navigation", () => {
  it("marks only the selected folder as active", () => {
    render(
      <Sidebar
        assets={[]}
        projects={[]}
        folders={[{ id: "folder-1", parentId: null, name: "工作账号" }]}
        active={{ view: "assets", folderId: "folder-1" }}
        onNavigate={vi.fn()}
        onSaveFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "全部凭证 0" })).not.toHaveClass("active");
    expect(screen.getByRole("button", { name: "工作账号" })).toHaveClass("active");
  });
});
