"use client";

import ReactFlow, { Background } from "reactflow";
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

  const edges = relations.map((r: any) => ({
    id: r.id,
    source: r.from_id,
    target: r.to_id,
    label: r.label,
  }));

  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}