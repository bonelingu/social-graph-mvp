"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";

import "reactflow/dist/style.css";

export default function Graph({
  people,
  relations,
  onNodeClick,
}: any) {
  const nodes = people.map(
    (p: any, index: number) => ({
      id: p.id,

      data: {
        label: (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              background: "white",
              border: "1px solid #ddd",
              minWidth: 120,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
              }}
            >
              {p.name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginTop: 6,
              }}
            >
              {p.relationship_tag}
            </div>
          </div>
        ),
      },

      position: {
        x: (index % 4) * 240,
        y: Math.floor(index / 4) * 180,
      },

      style: {
        border: "none",
        background: "transparent",
      },
    })
  );

  const edges = relations.map(
    (r: any, index: number) => ({
      id: r.id,

      source: r.from_person_id,
      target: r.to_person_id,

      label: r.relation_type,

      animated: r.strength >= 3,

      style: {
        strokeWidth: 2,
      },
    })
  );

  return (
    <div
      style={{
        width: "100%",
        height: "70vh",
        background: "white",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #ddd",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeClick={(e, node) =>
          onNodeClick(node.id)
        }
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}