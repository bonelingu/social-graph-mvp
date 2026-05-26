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
  onConnectRelation,
  onUpdateRelation,
  onNodePositionChange,
}: any) {
  const nodesInit = people.map((p: any) => ({
    id: p.id,
    position: { x: p.pos_x || 100, y: p.pos_y || 100 },
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

  useEffect(() => {
    setNodes(nodesInit);
    setEdges(edgesInit);
  }, [people, relations]);

  const onConnect = (params: any) => {
    setEdges((eds) => addEdge(params, eds));
    onConnectRelation(params.source, params.target);
  };

  const onEdgeDoubleClick = (_: any, edge: any) => {
    const value = prompt("修改关系", edge.label);
    if (value) onUpdateRelation(edge.id, value);
  };

  return (
    <div style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={onEdgeDoubleClick}
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