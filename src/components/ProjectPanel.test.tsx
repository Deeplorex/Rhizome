import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Project } from "../types";
import { ProjectPanel } from "./ProjectPanel";

const projects: Project[] = [
  {
    id: "project-1",
    name: "个人网站",
    description: "展示个人作品",
    repoPath: "",
    favorite: false,
    updatedAt: "2026-09-02T12:00:00Z",
    services: [],
    environments: [],
    bindings: [],
  },
];

describe("project panel", () => {
  it("uses plain personal-product language and creates a product", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <ProjectPanel
        projects={projects}
        selectedId="project-1"
        onSelect={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
        onSaveService={vi.fn()}
        onDeleteService={vi.fn()}
        onSaveEnvironment={vi.fn()}
        onDeleteEnvironment={vi.fn()}
      />,
    );

    expect(screen.getByText("0 项凭证")).toBeInTheDocument();
    expect(screen.queryByText(/依赖关系的落点|团队|权限/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "新建产品" }));
    await userEvent.type(screen.getByLabelText("产品名称"), "照片备份");
    await userEvent.click(screen.getByRole("button", { name: "保存产品" }));

    expect(onSave).toHaveBeenCalledWith({
      name: "照片备份",
      description: "",
      repoPath: "",
      favorite: false,
    });
  });

  it("uses product composition language and adds a composition", async () => {
    const onSaveService = vi.fn().mockResolvedValue(undefined);
    render(
      <ProjectPanel
        projects={projects}
        selectedId="project-1"
        onSelect={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onSaveService={onSaveService}
        onDeleteService={vi.fn()}
        onSaveEnvironment={vi.fn()}
        onDeleteEnvironment={vi.fn()}
      />,
    );

    expect(screen.getAllByText("产品组成").length).toBeGreaterThan(0);
    expect(screen.queryByText("服务组件")).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "添加" })[0]);
    expect(screen.getByRole("heading", { name: "添加产品组成" })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("名称"), "国内版小程序");
    await userEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(onSaveService).toHaveBeenCalledWith({
      projectId: "project-1",
      name: "国内版小程序",
      description: "",
    });
  });
});
