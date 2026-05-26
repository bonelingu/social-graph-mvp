// app/graph.tsx

"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";

import { useEffect } from "react";

export default function Graph({
  people,
  relations,
  onNodeClick,
  onConnectRelation,
  onNodePositionChange,
}: any) {

  const initialNodes: Node[] =
    people.map((p: any) => ({
      id: p.id,

      position: {
        x:
          p.pos_x ||
          Math.random() * 500,

        y:
          p.pos_y ||
          Math.random() * 500,
      },

      data: {
        label: (
          <div
            style={{
              padding: 12,
              background:
                "white",

              borderRadius: 16,

              border:
                "1px solid #ddd",

              minWidth: 120,
            }}
          >
            <div
              style={{
                fontWeight:
                  "bold",
              }}
            >
              {p.name}
            </div>

            <div
              style={{
                fontSize: 12,
                color:
                  "#666",
                marginTop: 4,
              }}
            >
              {
                p.relationship_tag
              }
            </div>
          </div>
        ),
      },

      style: {
        border: "none",
        background:
          "transparent",
      },
    }));

  const initialEdges: Edge[] =
    relations.map((r: any) => ({
      id: r.id,

      source:
        r.from_person_id,

      target:
        r.to_person_id,

      label:
        r.relation_type,

      animated:
        r.strength >= 3,
    }));

  const [
    nodes,
    setNodes,
    onNodesChange,
  ] = useNodesState(
    initialNodes
  );

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] = useEdgesState(
    initialEdges
  );

  useEffect(() => {
    nodes.forEach((node) => {
      onNodePositionChange(
        node.id,
        node.position.x,
        node.position.y
      );
    });
  }, [nodes]);

  const onConnect = async (
    params:
      | Edge
      | Connection
  ) => {

    setEdges((eds) =>
      addEdge(params, eds)
    );

    await onConnectRelation(
      params.source,
      params.target
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "90vh",
        background: "white",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}

        onNodesChange={
          onNodesChange
        }

        onEdgesChange={
          onEdgesChange
        }

        onConnect={onConnect}

        fitView

        onNodeDoubleClick={(
          e,
          node
        ) =>
          onNodeClick(
            node.id
          )
        }
      >
        <Background />

        <MiniMap />

        <Controls />
      </ReactFlow>
    </div>
  );
}