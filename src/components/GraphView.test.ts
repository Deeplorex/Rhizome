import { describe, expect, it } from "vitest";
import type { GraphNode } from "../types";
import { calculateGraphPositions, filterGraphNodes, getGraphConnections } from "./GraphView";

describe("graph layout", () => {
  it("places dependencies in left-to-right layers with horizontal connection lanes", () => {
    const nodes: GraphNode[] = [
      { id: "service-1", nodeType: "service", label: "OCR", subtitle: "产品组成" },
      { id: "asset-key", nodeType: "asset", label: "OCR Key", subtitle: "api_credential" },
      { id: "environment-1", nodeType: "environment", label: "Prod", subtitle: "环境" },
      { id: "platform-1", nodeType: "platform", label: "阿里云", subtitle: "平台账号" },
      { id: "asset-account", nodeType: "asset", label: "阿里云账号", subtitle: "web_account" },
      { id: "project-1", nodeType: "project", label: "票据识别", subtitle: "产品" },
    ];
    const edges = [
      { id: "platform", source: "platform-1", target: "asset-account", label: "签发" },
      { id: "child", source: "asset-account", target: "asset-key", label: "子凭证" },
      { id: "uses", source: "asset-key", target: "project-1", label: "使用" },
      { id: "contains", source: "project-1", target: "service-1", label: "包含" },
      { id: "deploys", source: "service-1", target: "environment-1", label: "部署" },
    ];

    const positions = calculateGraphPositions(nodes, edges);

    expect(
      ["platform-1", "asset-account", "asset-key", "project-1", "service-1", "environment-1"].map(
        (id) => positions.get(id)?.x,
      ),
    ).toEqual([48, 268, 488, 708, 928, 1148]);
    expect(new Set(nodes.map((node) => positions.get(node.id)?.y))).toEqual(new Set([48]));
  });

  it("searches node labels, subtitles, and localized types", () => {
    const nodes: GraphNode[] = [
      { id: "asset-1", nodeType: "asset", label: "DeepSeek API", subtitle: "api_credential" },
      { id: "service-1", nodeType: "service", label: "OCR worker", subtitle: "AI 合规检测" },
    ];

    expect(filterGraphNodes(nodes, "DeepSeek").map((node) => node.id)).toEqual(["asset-1"]);
    expect(filterGraphNodes(nodes, "合规").map((node) => node.id)).toEqual(["service-1"]);
    expect(filterGraphNodes(nodes, "凭证").map((node) => node.id)).toEqual(["asset-1"]);
    expect(filterGraphNodes(nodes, "产品组成").map((node) => node.id)).toEqual(["service-1"]);
  });

  it("packs separate small relationships into the same visual row", () => {
    const nodes: GraphNode[] = [
      { id: "platform-a", nodeType: "platform", label: "A", subtitle: "平台" },
      { id: "asset-a", nodeType: "asset", label: "A Key", subtitle: "凭证" },
      { id: "platform-b", nodeType: "platform", label: "B", subtitle: "平台" },
      { id: "asset-b", nodeType: "asset", label: "B Key", subtitle: "凭证" },
    ];
    const positions = calculateGraphPositions(nodes, [
      { id: "a", source: "platform-a", target: "asset-a", label: "提供" },
      { id: "b", source: "platform-b", target: "asset-b", label: "提供" },
    ]);

    expect(positions.get("platform-a")?.y).toBe(positions.get("platform-b")?.y);
    expect(positions.get("platform-b")?.x).toBeGreaterThan(positions.get("asset-a")?.x || 0);
  });

  it("builds the selected node detail from incoming and outgoing edges", () => {
    const nodes: GraphNode[] = [
      { id: "platform-1", nodeType: "platform", label: "Google", subtitle: "平台账号" },
      { id: "asset-1", nodeType: "asset", label: "Gemini API", subtitle: "API 凭证" },
      { id: "project-1", nodeType: "project", label: "AI 检测", subtitle: "产品" },
    ];
    const connections = getGraphConnections(
      {
        nodes,
        edges: [
          { id: "issued", source: "platform-1", target: "asset-1", label: "签发" },
          { id: "used", source: "asset-1", target: "project-1", label: "调用" },
        ],
      },
      "asset-1",
    );

    expect(connections.map((item) => [item.node.id, item.direction, item.edge.label])).toEqual([
      ["platform-1", "incoming", "签发"],
      ["project-1", "outgoing", "调用"],
    ]);
  });
});
