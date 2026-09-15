import { render, screen, waitFor } from "@testing-library/react";
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

const panelProps = {
  projects,
  selectedId: "project-1",
  onSelect: vi.fn(),
  onOpenAsset: vi.fn(),
  onSave: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn(),
  onSaveService: vi.fn().mockResolvedValue(undefined),
  onDeleteService: vi.fn(),
  onSaveEnvironment: vi.fn().mockResolvedValue(undefined),
  onDeleteEnvironment: vi.fn(),
};

describe("project panel", () => {
  it("uses plain personal-product language and creates a product", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ProjectPanel {...panelProps} onSave={onSave} />);

    expect(screen.getByText("0 项凭证")).toBeInTheDocument();
    expect(screen.queryByText(/依赖关系的落点|团队|权限/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "新建产品" }));
    await userEvent.type(screen.getByLabelText("产品名称"), "照片备份");
    await userEvent.click(screen.getByRole("button", { name: "保存产品" }));

    expect(onSave).toHaveBeenCalledWith({
      logo: "",
      name: "照片备份",
      description: "",
      repoPath: "",
      favorite: false,
    });
  });

  it("uses product composition language and adds a composition", async () => {
    const onSaveService = vi.fn().mockResolvedValue(undefined);
    render(<ProjectPanel {...panelProps} onSaveService={onSaveService} />);

    expect(screen.getAllByText("产品组成").length).toBeGreaterThan(0);
    expect(screen.queryByText("服务组件")).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "添加" })[0]);
    expect(screen.getByRole("heading", { name: "添加产品组成" })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("名称"), "国内版小程序");
    await userEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(onSaveService).toHaveBeenCalledWith({
      id: null,
      projectId: "project-1",
      name: "国内版小程序",
      description: "",
    });
  });

  it("stars and unstars the product from the detail header", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const starred: Project[] = [
      { ...projects[0], logo, description: "展示个人作品", repoPath: "D:/example", favorite: true },
    ];
    const { rerender } = render(
      <ProjectPanel
        {...panelProps}
        onSave={onSave}
        projects={[{ ...starred[0], favorite: false }]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "星标产品" }));
    expect(onSave).toHaveBeenCalledWith({
      id: "project-1",
      name: "个人网站",
      description: "展示个人作品",
      logo,
      repoPath: "D:/example",
      favorite: true,
    });

    rerender(<ProjectPanel {...panelProps} onSave={onSave} projects={starred} />);
    await userEvent.click(screen.getByRole("button", { name: "取消产品星标" }));
    expect(onSave).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "project-1", favorite: false }),
    );
  });

  it("edits an existing product composition from its row", async () => {
    const onSaveService = vi.fn().mockResolvedValue(undefined);
    render(
      <ProjectPanel
        {...panelProps}
        onSaveService={onSaveService}
        projects={[
          {
            ...projects[0],
            services: [
              {
                id: "service-sync",
                projectId: "project-1",
                name: "作品同步",
                description: "旧说明",
              },
            ],
          },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "编辑产品组成 作品同步" }));
    expect(screen.getByRole("heading", { name: "编辑产品组成" })).toBeInTheDocument();
    expect(screen.getByLabelText("名称")).toHaveValue("作品同步");
    expect(screen.getByLabelText("说明")).toHaveValue("旧说明");
    await userEvent.clear(screen.getByLabelText("名称"));
    await userEvent.type(screen.getByLabelText("名称"), "国内版小程序");
    await userEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(onSaveService).toHaveBeenCalledWith({
      id: "service-sync",
      projectId: "project-1",
      name: "国内版小程序",
      description: "旧说明",
    });
  });

  it("shows the full product path and opens credential details from a used credential", async () => {
    const onOpenAsset = vi.fn();
    render(
      <ProjectPanel
        {...panelProps}
        onOpenAsset={onOpenAsset}
        projects={[
          {
            ...projects[0],
            services: [
              { id: "service-sync", projectId: "project-1", name: "作品同步", description: "" },
            ],
            bindings: [
              {
                id: "binding-github",
                assetId: "asset-github",
                assetTitle: "GitHub API",
                consumerKind: "service",
                consumerId: "service-sync",
                consumerName: "作品同步",
                purpose: "读取公开仓库",
                configKey: "GITHUB_TOKEN",
                environment: "prod",
                notes: "",
                lastVerifiedAt: null,
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("1 项凭证")).toBeInTheDocument();
    expect(
      screen.getByText("个人网站 / 作品同步 · 读取公开仓库 · GITHUB_TOKEN · 生产"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "查看凭证 GitHub API 详情" }));
    expect(onOpenAsset).toHaveBeenCalledWith("asset-github");
  });
});

const logo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1cAAAAASUVORK5CYII=";
function editor(onSave = vi.fn().mockResolvedValue(undefined)) {
  render(
    <ProjectPanel
      {...panelProps}
      onSave={onSave}
      projects={[{ ...projects[0], logo, favorite: true, repoPath: "D:/example" }]}
    />,
  );
  return onSave;
}
it("edits the existing product while preserving its metadata and logo", async () => {
  const onSave = editor();
  await userEvent.click(screen.getByRole("button", { name: "编辑产品" }));
  expect(screen.getByLabelText("说明")).toHaveValue("展示个人作品");
  await userEvent.clear(screen.getByLabelText("产品名称"));
  await userEvent.type(screen.getByLabelText("产品名称"), "新名称");
  await userEvent.clear(screen.getByLabelText("说明"));
  await userEvent.type(screen.getByLabelText("说明"), "新说明");
  await userEvent.click(screen.getByRole("button", { name: "保存产品" }));
  expect(onSave).toHaveBeenCalledWith({
    id: "project-1",
    name: "新名称",
    description: "新说明",
    logo,
    favorite: true,
    repoPath: "D:/example",
  });
});
it("discards canceled edits and can restore the default logo", async () => {
  const onSave = editor();
  await userEvent.click(screen.getByRole("button", { name: "编辑产品" }));
  await userEvent.clear(screen.getByLabelText("产品名称"));
  await userEvent.click(screen.getByRole("button", { name: "恢复默认图标" }));
  await userEvent.click(screen.getByRole("button", { name: "取消" }));
  expect(onSave).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "编辑产品" }));
  expect(screen.getByLabelText("产品名称")).toHaveValue("个人网站");
  expect(screen.getByRole("button", { name: "恢复默认图标" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "恢复默认图标" }));
  await userEvent.click(screen.getByRole("button", { name: "保存产品" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: "project-1", logo: "" }));
});
it("uploads a local logo and keeps failed saves editable", async () => {
  const onSave = editor(vi.fn().mockRejectedValue(new Error("保存失败")));
  const imageMock = vi.spyOn(globalThis, "Image").mockImplementation(function MockImage() {
    const image = document.createElement("img");
    queueMicrotask(() => image.dispatchEvent(new Event("load")));
    return image;
  });
  try {
    await userEvent.click(screen.getByRole("button", { name: "编辑产品" }));
    await userEvent.upload(
      screen.getByLabelText("自定义 Logo"),
      new File(["local-image"], "logo.png", { type: "image/png" }),
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "保存产品" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "保存产品" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ logo: "data:image/png;base64,bG9jYWwtaW1hZ2U=" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("保存失败");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  } finally {
    imageMock.mockRestore();
  }
});
it("rejects oversized logos without changing the saved logo", async () => {
  const onSave = editor();
  await userEvent.click(screen.getByRole("button", { name: "编辑产品" }));
  await userEvent.upload(
    screen.getByLabelText("自定义 Logo"),
    new File([new Uint8Array(1024 * 1024 + 1)], "large.png", { type: "image/png" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Logo 必须为不超过 1 MB");
  await userEvent.click(screen.getByRole("button", { name: "保存产品" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ logo }));
});
