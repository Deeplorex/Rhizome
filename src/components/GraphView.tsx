import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type Node,
  Position,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  ExternalLink,
  Focus,
  KeyRound,
  Layers3,
  Network,
  Search,
  ServerCog,
  X,
} from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";
import { translate, useI18n } from "../lib/i18n";
import { KIND_LABELS } from "../lib/assetTemplates";
import { formatEnvironment } from "../lib/format";
import type { AssetKind } from "../types";
import type { GraphData, GraphEdge, GraphNode } from "../types";
import { PlatformLogo } from "./PlatformLogo";

const palette: Record<GraphNode["nodeType"], string> = {
  platform: "#3f9987",
  asset: "#d66c47",
  project: "#39728a",
  service: "#b58a4a",
  environment: "#78947d",
};

const nodeTypeLabels: Record<GraphNode["nodeType"], string> = {
  platform: "平台",
  asset: "凭证",
  project: "产品",
  service: "产品组成",
  environment: "环境",
};

const assetKindCodes = new Set<AssetKind>(Object.keys(KIND_LABELS) as AssetKind[]);

interface GraphViewProps {
  data: GraphData;
  focusId?: string;
  onFocus: (id?: string) => void;
  onOpenNode: (node: GraphNode) => void;
}

export interface GraphConnection {
  edge: GraphEdge;
  node: GraphNode;
  direction: "incoming" | "outgoing";
}

function assetColumn(
  item: GraphNode,
  incoming: Map<string, GraphEdge[]>,
  nodesById: Map<string, GraphNode>,
  visiting = new Set<string>(),
): number {
  if (visiting.has(item.id)) return 1;
  visiting.add(item.id);
  const depth = (incoming.get(item.id) || []).reduce((maximum, edge) => {
    const source = nodesById.get(edge.source);
    if (!source || (source.nodeType !== "platform" && source.nodeType !== "asset")) return maximum;
    return Math.max(
      maximum,
      source.nodeType === "platform"
        ? 1
        : assetColumn(source, incoming, nodesById, new Set(visiting)) + 1,
    );
  }, 1);
  return depth;
}

export function calculateGraphPositions(
  items: GraphNode[],
  edges: GraphEdge[] = [],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const nodesById = new Map(items.map((item) => [item.id, item]));
  const validEdges = edges.filter(
    (edge) => nodesById.has(edge.source) && nodesById.has(edge.target),
  );
  const incoming = new Map<string, GraphEdge[]>();
  const neighbors = new Map(items.map((item) => [item.id, new Set<string>()]));
  for (const edge of validEdges) {
    incoming.set(edge.target, [...(incoming.get(edge.target) || []), edge]);
    neighbors.get(edge.source)?.add(edge.target);
    neighbors.get(edge.target)?.add(edge.source);
  }

  const assetColumns = new Map(
    items
      .filter((item) => item.nodeType === "asset")
      .map((item) => [item.id, assetColumn(item, incoming, nodesById)]),
  );
  const components: GraphNode[][] = [];
  const isolated: GraphNode[] = [];
  const visited = new Set<string>();
  for (const item of items) {
    if (visited.has(item.id)) continue;
    if (neighbors.get(item.id)?.size === 0) {
      visited.add(item.id);
      isolated.push(item);
      continue;
    }
    const component: GraphNode[] = [];
    const pending = [item.id];
    visited.add(item.id);
    while (pending.length) {
      const id = pending.shift();
      const node = id ? nodesById.get(id) : undefined;
      if (node) component.push(node);
      for (const neighbor of id ? neighbors.get(id) || [] : []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          pending.push(neighbor);
        }
      }
    }
    components.push(component);
  }
  if (isolated.length) components.push(isolated);
  components.sort((left, right) => right.length - left.length);

  const origin = 48;
  const nodeWidth = 205;
  const nodeHeight = 72;
  const columnStep = 220;
  const rowStep = 112;
  const componentGap = 48;
  const rowWidth = 1120;
  let componentLeft = origin;
  let componentTop = origin;
  let packedRowHeight = 0;
  for (const component of components) {
    const componentAssetColumn = Math.max(
      1,
      ...component
        .filter((item) => item.nodeType === "asset")
        .map((item) => assetColumns.get(item.id) || 1),
    );
    const rawColumnOf = (item: GraphNode) => {
      if (item.nodeType === "platform") return 0;
      if (item.nodeType === "asset") return assetColumns.get(item.id) || 1;
      if (item.nodeType === "project") return componentAssetColumn + 1;
      if (item.nodeType === "service") return componentAssetColumn + 2;
      return componentAssetColumn + 3;
    };
    const minimumColumn = Math.min(...component.map(rawColumnOf));
    const columnOf = (item: GraphNode) => rawColumnOf(item) - minimumColumn;
    const columns = new Map<number, GraphNode[]>();
    for (const item of component) {
      const column = columnOf(item);
      columns.set(column, [...(columns.get(column) || []), item]);
    }
    for (const columnItems of columns.values()) {
      columnItems.sort((left, right) => left.label.localeCompare(right.label, "zh-CN"));
    }
    const componentRows = Math.max(1, ...[...columns.values()].map((column) => column.length));
    const componentColumns = Math.max(...columns.keys()) + 1;
    const componentWidth = (componentColumns - 1) * columnStep + nodeWidth;
    const componentHeight = (componentRows - 1) * rowStep + nodeHeight;
    if (componentLeft > origin && componentLeft + componentWidth > origin + rowWidth) {
      componentLeft = origin;
      componentTop += packedRowHeight + componentGap;
      packedRowHeight = 0;
    }
    for (const [column, columnItems] of columns) {
      const topOffset = ((componentRows - columnItems.length) * rowStep) / 2;
      columnItems.forEach((item, row) => {
        positions.set(item.id, {
          x: componentLeft + column * columnStep,
          y: componentTop + topOffset + row * rowStep,
        });
      });
    }
    componentLeft += componentWidth + componentGap;
    packedRowHeight = Math.max(packedRowHeight, componentHeight);
  }
  return positions;
}

export function filterGraphNodes(items: GraphNode[], query: string): GraphNode[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return items;
  return items.filter((item) =>
    [
      item.label,
      item.subtitle,
      nodeTypeLabels[item.nodeType],
      translate(nodeTypeLabels[item.nodeType], "en-US"),
      translate(item.subtitle, "en-US"),
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalized),
  );
}

export function getGraphConnections(data: GraphData, nodeId: string): GraphConnection[] {
  const nodesById = new Map(data.nodes.map((node) => [node.id, node]));
  return data.edges.flatMap<GraphConnection>((edge): GraphConnection[] => {
    if (edge.source === nodeId) {
      const node = nodesById.get(edge.target);
      return node ? [{ edge, node, direction: "outgoing" as const }] : [];
    }
    if (edge.target === nodeId) {
      const node = nodesById.get(edge.source);
      return node ? [{ edge, node, direction: "incoming" as const }] : [];
    }
    return [];
  });
}

export function GraphView({ data, focusId, onFocus, onOpenNode }: GraphViewProps) {
  const { language, t } = useI18n();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [flow, setFlow] = useState<ReactFlowInstance<Node, Edge>>();
  const matches = useMemo(() => filterGraphNodes(data.nodes, query), [data.nodes, query]);
  const matchedIds = useMemo(() => new Set(matches.map((node) => node.id)), [matches]);
  const selectedNode = useMemo(
    () => data.nodes.find((node) => node.id === focusId),
    [data.nodes, focusId],
  );
  const connections = useMemo(
    () => (focusId ? getGraphConnections(data, focusId) : []),
    [data, focusId],
  );
  const focusedNeighborhood = useMemo(
    () => new Set([focusId, ...connections.map((connection) => connection.node.id)]),
    [connections, focusId],
  );
  const subtitleFor = useCallback(
    (node: GraphNode) => {
      if (node.nodeType === "platform") return t("平台账号");
      if (node.nodeType === "project") return t("产品");
      if (node.nodeType === "environment") return formatEnvironment(node.subtitle, language);
      if (node.nodeType === "service") return node.subtitle;
      return node.subtitle
        .split(" · ")
        .filter(Boolean)
        .map((part) =>
          assetKindCodes.has(part as AssetKind)
            ? t(KIND_LABELS[part as AssetKind])
            : formatEnvironment(part, language) || part,
        )
        .join(" · ");
    },
    [language, t],
  );

  const focusNode = useCallback(
    (id: string) => {
      onFocus(id);
      const target = flow?.getNode(id);
      if (target) {
        void flow?.fitView({ nodes: [target], padding: 0.7, maxZoom: 1.05, duration: 260 });
      }
    },
    [flow, onFocus],
  );

  const showGlobal = useCallback(() => {
    setQuery("");
    onFocus(undefined);
    void flow?.fitView({ padding: 0.08, maxZoom: 0.95, duration: 260 });
  }, [flow, onFocus]);

  const nodes = useMemo<Node[]>(() => {
    const positions = calculateGraphPositions(data.nodes, data.edges);
    const hasQuery = query.trim().length > 0;
    return data.nodes.map((item) => {
      const GraphIcon =
        item.nodeType === "project"
          ? Boxes
          : item.nodeType === "service"
            ? ServerCog
            : item.nodeType === "environment"
              ? Layers3
              : KeyRound;
      const classes = ["graph-node-shell"];
      if (focusId === item.id) classes.push("graph-node-shell--focus");
      if (
        (focusId && !focusedNeighborhood.has(item.id)) ||
        (hasQuery && !matchedIds.has(item.id))
      ) {
        classes.push("graph-node-shell--muted");
      }
      return {
        id: item.id,
        position: positions.get(item.id) || { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: (
            <div className="graph-node">
              {item.nodeType === "platform" ? (
                <PlatformLogo
                  platform={item.label}
                  kind="web_account"
                  className="graph-node__logo"
                />
              ) : (
                <span className="graph-node__logo graph-node__logo--entity" aria-hidden="true">
                  <GraphIcon size={19} />
                </span>
              )}
              <span className="graph-node__copy">
                <small>{t(nodeTypeLabels[item.nodeType])}</small>
                <strong>{item.label}</strong>
                <span>{subtitleFor(item)}</span>
              </span>
            </div>
          ),
        },
        className: classes.join(" "),
        style: {
          borderColor: palette[item.nodeType],
          "--node-color": palette[item.nodeType],
        } as React.CSSProperties,
      };
    });
  }, [data.edges, data.nodes, focusId, focusedNeighborhood, matchedIds, query, subtitleFor, t]);

  const edges = useMemo<Edge[]>(
    () =>
      data.edges.map((item) => {
        const connected = focusId === item.source || focusId === item.target;
        return {
          id: item.id,
          source: item.source,
          target: item.target,
          label: t(item.label),
          type: "smoothstep",
          animated: connected,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: connected ? "var(--forest)" : "var(--graph-line)",
          },
          pathOptions: { borderRadius: 14, offset: 30 },
          interactionWidth: 18,
          zIndex: connected ? 2 : 0,
          style: {
            stroke: connected ? "var(--forest)" : "var(--graph-line)",
            strokeWidth: connected ? 2.4 : 1.7,
            opacity: focusId && !connected ? 0.22 : 0.82,
          },
          labelStyle: { fill: "var(--ink-soft)", fontSize: 11, fontWeight: 650 },
          labelShowBg: true,
          labelBgStyle: { fill: "var(--paper-raised)", fillOpacity: 0.94 },
          labelBgPadding: [5, 3] as [number, number],
          labelBgBorderRadius: 4,
        };
      }),
    [data.edges, focusId, t],
  );

  const openLabel = selectedNode
    ? selectedNode.nodeType === "asset"
      ? t("打开凭证详情")
      : selectedNode.nodeType === "platform"
        ? t("查看平台凭证")
        : t("打开产品详情")
    : "";

  return (
    <section className="graph-view">
      <header className="graph-head">
        <div>
          <h1>{t("关系图谱")}</h1>
          <p>{t("查看每个凭证属于哪个平台，又被哪些产品组成使用。")}</p>
        </div>
        <div className="graph-head__actions">
          <div className="graph-search">
            <Search size={16} aria-hidden="true" />
            <label className="sr-only" htmlFor={searchId}>
              {t("搜索节点")}
            </label>
            <input
              id={searchId}
              name="graph-search"
              value={query}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && matches[0]) {
                  focusNode(matches[0].id);
                  setQuery("");
                }
                if (event.key === "Escape") setQuery("");
              }}
              placeholder={t("搜索平台、凭证、产品、产品组成…")}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label={t("清除节点搜索")}>
                <X size={15} />
              </button>
            )}
            {query.trim() && (
              <div className="graph-search__results">
                <small>{t("{count} 个匹配节点", { count: matches.length })}</small>
                {matches.slice(0, 8).map((node) => (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => {
                      focusNode(node.id);
                      setQuery("");
                    }}
                  >
                    <i style={{ background: palette[node.nodeType] }} />
                    <span>
                      <strong>{node.label}</strong>
                      <small>
                        {t(nodeTypeLabels[node.nodeType])} · {subtitleFor(node)}
                      </small>
                    </span>
                  </button>
                ))}
                {matches.length === 0 && <p>{t("没有找到匹配节点")}</p>}
              </div>
            )}
          </div>
          <button type="button" className="secondary-button" onClick={showGlobal}>
            <Focus size={16} />
            {t("显示全局")}
          </button>
        </div>
      </header>
      {nodes.length === 0 ? (
        <div className="graph-empty">
          <Network size={32} />
          <h2>{t("还没有关系")}</h2>
          <p>{t("先添加凭证、产品并建立关联。")}</p>
        </div>
      ) : (
        <div className="graph-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.08, maxZoom: 0.95 }}
            minZoom={0.35}
            maxZoom={1.5}
            onInit={setFlow}
            onNodeClick={(_, node) => focusNode(node.id)}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} />
            <MiniMap
              nodeColor={(node) => String(node.style?.borderColor || "#245d55")}
              maskColor="var(--minimap-mask)"
            />
            <Controls showInteractive={false} />
          </ReactFlow>

          {selectedNode && (
            <aside
              className="graph-inspector"
              aria-label={t("{title} 节点详情", { title: selectedNode.label })}
            >
              <header>
                <div>
                  <span style={{ color: palette[selectedNode.nodeType] }}>
                    {t(nodeTypeLabels[selectedNode.nodeType])}
                  </span>
                  <h2>{selectedNode.label}</h2>
                  <p>{selectedNode.subtitle ? subtitleFor(selectedNode) : t("暂无补充说明")}</p>
                  {selectedNode.status && <p>{t("到期：{date}", { date: selectedNode.status })}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onFocus(undefined)}
                  aria-label={t("关闭节点详情")}
                >
                  <X size={17} />
                </button>
              </header>
              <div className="graph-inspector__summary">
                <span>
                  <small>{t("关联")}</small>
                  <strong>{connections.length}</strong>
                </span>
                <span>
                  <small>{t("来源")}</small>
                  <strong>
                    {connections.filter((item) => item.direction === "incoming").length}
                  </strong>
                </span>
                <span>
                  <small>{t("去向")}</small>
                  <strong>
                    {connections.filter((item) => item.direction === "outgoing").length}
                  </strong>
                </span>
              </div>
              <div className="graph-inspector__connections">
                <h3>{t("相关节点")}</h3>
                {connections.length === 0 ? (
                  <p>{t("当前节点还没有依赖关系。")}</p>
                ) : (
                  connections.map((connection) => (
                    <button
                      type="button"
                      key={connection.edge.id}
                      onClick={() => focusNode(connection.node.id)}
                    >
                      {connection.direction === "incoming" ? (
                        <ArrowDownLeft size={15} />
                      ) : (
                        <ArrowUpRight size={15} />
                      )}
                      <span>
                        <strong>{connection.node.label}</strong>
                        <small>
                          {t(connection.edge.label)} · {t(nodeTypeLabels[connection.node.nodeType])}
                        </small>
                      </span>
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                className="primary-button graph-inspector__open"
                onClick={() => onOpenNode(selectedNode)}
              >
                {openLabel}
                <ExternalLink size={15} />
              </button>
            </aside>
          )}

          <div className="graph-legend">
            {(Object.keys(nodeTypeLabels) as GraphNode["nodeType"][]).map((nodeType) => (
              <span key={nodeType}>
                <i style={{ background: palette[nodeType] }} />
                {t(nodeTypeLabels[nodeType])}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
