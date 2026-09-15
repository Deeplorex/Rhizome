import { describe, expect, it } from "vitest";
import { consumerPath, formatEnvironment } from "./format";
import type { Project } from "../types";

describe("formatEnvironment", () => {
  it("uses plain Chinese labels for common deployment environments", () => {
    expect(formatEnvironment("prod")).toBe("生产");
    expect(formatEnvironment("Staging")).toBe("预发布");
    expect(formatEnvironment("home")).toBe("home");
  });

  it("uses English labels when the interface is English", () => {
    expect(formatEnvironment("prod", "en-US")).toBe("Production");
    expect(formatEnvironment("Staging", "en-US")).toBe("Staging");
    expect(formatEnvironment("home", "en-US")).toBe("home");
  });
});

const projects: Project[] = [
  {
    id: "project-website",
    name: "个人网站",
    description: "",
    repoPath: "",
    favorite: false,
    updatedAt: "2026-09-02T12:00:00Z",
    services: [
      { id: "service-sync", projectId: "project-website", name: "作品同步", description: "" },
    ],
    environments: [
      {
        id: "environment-daily",
        projectId: "project-website",
        serviceId: "service-sync",
        name: "日常使用",
        kind: "prod",
      },
      {
        id: "environment-project",
        projectId: "project-website",
        serviceId: null,
        name: "项目级",
        kind: "dev",
      },
    ],
    bindings: [],
  },
];

describe("consumerPath", () => {
  it("shows the full product chain for composition and environment consumers", () => {
    expect(
      consumerPath(projects, {
        consumerKind: "service",
        consumerId: "service-sync",
        consumerName: "作品同步",
      }),
    ).toBe("个人网站 / 作品同步");
    expect(
      consumerPath(projects, {
        consumerKind: "environment",
        consumerId: "environment-daily",
        consumerName: "日常使用",
      }),
    ).toBe("个人网站 / 作品同步 / 日常使用");
  });

  it("keeps the product-level environment path without a composition segment", () => {
    expect(
      consumerPath(projects, {
        consumerKind: "environment",
        consumerId: "environment-project",
        consumerName: "项目级",
      }),
    ).toBe("个人网站 / 项目级");
    expect(
      consumerPath(projects, {
        consumerKind: "project",
        consumerId: "project-website",
        consumerName: "个人网站",
      }),
    ).toBe("个人网站");
  });

  it("falls back to the stored consumer name when the consumer is gone", () => {
    expect(
      consumerPath([], {
        consumerKind: "service",
        consumerId: "service-gone",
        consumerName: "已删除产品组成",
      }),
    ).toBe("已删除产品组成");
  });
});
