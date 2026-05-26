"use client";

import ReactFlow, { Background, Edge } from "reactflow";
import "reactflow/dist/style.css";

export default function Graph({ people, relations }: any) {
  const nodes = people.map((p: any, i: number) => ({
    id: p.id,
    data: { label: p.name },
    position: {
      x: (i % 4) * 180,
      y: Math.floor(i / 4) * 120,
    },
  }));

  // ⭐ 支持同一对人多条关系（关键）
  const edges: Edge[] = relations.map((r: any, index: number) => ({
    id: r.id || `${r.from_id}-${r.to_id}-${index}`,
    source: r.from_id,
    target: r.to_id,
    label: r.type,
    animated: r.type === "close_friend",
    style: {
      stroke:
        r.type === "friend"
          ? "#3b82f6"
          : r.type === "classmate"
          ? "#22c55e"
          : "#94a3b8",
    },
  }));

  return (
    <div style={{ height: 600, width: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}