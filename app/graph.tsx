"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
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
  const nodesInit = people.map((p: any) => ({
    id: p.id,
    position: {
      x: p.pos_x || 100,
      y: p.pos_y || 100,
    },
    data: { label: p.name },
  }));

  const edgesInit = relations.map((r: any) => ({
    id: r.id,
    source: r.from_person_id,
    target: r.to_person_id,
    label: r.relation_type,
  }));

  const [nodes, setNodes, onNodesChange] =
    useNodesState(nodesInit);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(edgesInit);

  // 🔥 关键修复：必须同步更新
  useEffect(() => {
    setNodes(nodesInit);
    setEdges(edgesInit);
  }, [people, relations]);

  const onConnect = (params: any) => {
    setEdges((eds) => addEdge(params, eds));
    onConnectRelation(params.source, params.target);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(e, node) =>
          onNodeClick(node.id)
        }
        onNodeDragStop={(e, node) =>
          onNodePositionChange(
            node.id,
            node.position.x,
            node.position.y
          )
        }
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}