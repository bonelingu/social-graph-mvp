"use client";

import { useEffect, useMemo } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";

export default function Graph({
  people,
  relations,
  onConnectRelation,
  onUpdateRelation,
  onDeleteRelation,
  onSelectPerson,
}: any) {
  // =========================
  // 自动聚类（按标签）
  // =========================
  const groupX: any = {
    朋友: 100,
    同学: 500,
    家人: 900,
    同事: 1300,
  };

  // =========================
  // Nodes
  // =========================
  const nodesInit = useMemo(() => {
    return people.map((p: any, index: number) => ({
      id: p.id,

      position: {
        x:
          p.pos_x ??
          (groupX[p.relationship_tag] || 300),

        y:
          p.pos_y ??
          100 + (index % 8) * 120,
      },

      data: {
        label: (
          <div
            style={{
              padding: 6,
              minWidth: 120,
            }}
          >
            <div
              style={{
                fontWeight: 700,
              }}
            >
              {p.name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#666",
              }}
            >
              {p.relationship_tag || "未分类"}
            </div>
          </div>
        ),
      },

      style: {
        borderRadius: 12,
        border: "1px solid #ddd",
        padding: 10,
        background: "white",
      },
    }));
  }, [people]);

  // =========================
  // Edges
  // =========================
  const edgesInit = useMemo(() => {
    return relations.map((r: any) => ({
      id: r.id,

      source: r.from_person_id,

      target: r.to_person_id,

      label: r.relation_type,

      animated: true,
    }));
  }, [relations]);

  const [nodes, setNodes, onNodesChange] =
    useNodesState(nodesInit);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(edgesInit);

  // =========================
  // 同步数据
  // =========================
  useEffect(() => {
    setNodes(nodesInit);
  }, [nodesInit]);

  useEffect(() => {
    setEdges(edgesInit);
  }, [edgesInit]);

  // =========================
  // 创建关系
  // =========================
  const onConnect = async (params: any) => {
    await onConnectRelation(
      params.source,
      params.target
    );
  };

  // =========================
  // 双击编辑关系
  // =========================
  const onEdgeDoubleClick = (
    _: any,
    edge: any
  ) => {
    const value = prompt(
      "修改关系",
      edge.label
    );

    if (value) {
      onUpdateRelation(edge.id, value);
    }
  };

  // =========================
  // 删除关系
  // =========================
  const onEdgeContextMenu = (
    e: any,
    edge: any
  ) => {
    e.preventDefault();

    const ok = confirm(
      "删除这条关系？"
    );

    if (ok) {
      onDeleteRelation(edge.id);
    }
  };

  // =========================
  // 点击人物
  // =========================
  const handleNodeClick = (
    _: any,
    node: any
  ) => {
    const person = people.find(
      (p: any) => p.id === node.id
    );

    onSelectPerson(person);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeDoubleClick={
          onEdgeDoubleClick
        }
        onEdgeContextMenu={
          onEdgeContextMenu
        }
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}