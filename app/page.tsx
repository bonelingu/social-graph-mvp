"use client";

import { useEffect, useState } from "react";

import Auth from "@/components/Auth";
import Graph from "@/components/Graph";

import { useAuth } from "@/hooks/useAuth";
import { usePeople } from "@/hooks/usePeople";
import { useRelations } from "@/hooks/useRelations";

export default function Page() {
  // =========================
  // 登录
  // =========================
  const { user } = useAuth();

  // =========================
  // 数据层
  // =========================
  const {
    people,
    load: loadPeople,
    addPerson,
    updatePerson,
    deletePerson,
  } = usePeople(user?.id);

  const {
    relations,
    load: loadRelations,
    addRelation,
    updateRelation,
    deleteRelation,
  } = useRelations(user?.id);

  // =========================
  // UI状态
  // =========================
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");

  // =========================
  // 初始化加载
  // =========================
  useEffect(() => {
    if (user) {
      loadPeople();
      loadRelations();
    }
  }, [user]);

  // =========================
  // 搜索过滤（核心）
  // =========================
  const filteredPeople = people.filter((p: any) => {
    const text = `
      ${p.name || ""}
      ${p.relationship_tag || ""}
      ${p.notes || ""}
      ${p.company || ""}
      ${p.city || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  // =========================
  // 未登录
  // =========================
  if (!user) {
    return <Auth />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* =========================
          左侧：列表 + 搜索
      ========================= */}
      <div
        style={{
          width: 280,
          borderRight: "1px solid #ddd",
          padding: 12,
          overflow: "auto",
        }}
      >
        <h3>人物</h3>

        {/* 搜索框 */}
        <input
          placeholder="搜索姓名 / 标签 / 备注"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 6,
            marginBottom: 10,
          }}
        />

        {/* 添加按钮 */}
        <button
          onClick={addPerson}
          style={{ marginBottom: 10 }}
        >
          + 添加人物
        </button>

        {/* 列表 */}
        {filteredPeople.map((p: any) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            style={{
              padding: 10,
              marginBottom: 8,
              border:
                selected?.id === p.id
                  ? "2px solid #0070f3"
                  : "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {p.name}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {p.relationship_tag || "未分类"}
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          中间：图谱
      ========================= */}
      <div style={{ flex: 1 }}>
        <Graph
          people={people}
          relations={relations}
          onConnectRelation={addRelation}
          onUpdateRelation={updateRelation}
          onDeleteRelation={deleteRelation}
          onSelectPerson={setSelected}
        />
      </div>

      {/* =========================
          右侧：编辑器
      ========================= */}
      <div
        style={{
          width: 320,
          borderLeft: "1px solid #ddd",
          padding: 16,
          overflow: "auto",
        }}
      >
        {!selected ? (
          <div style={{ color: "#666" }}>
            点击左侧或图中节点进行编辑
          </div>
        ) : (
          <>
            <h3>编辑人物</h3>

            {/* 姓名 */}
            <input
              placeholder="姓名"
              value={selected.name || ""}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  name: e.target.value,
                })
              }
              style={{ width: "100%", marginBottom: 8 }}
            />

            {/* 标签 */}
            <input
              placeholder="标签（朋友/同学/家人）"
              value={selected.relationship_tag || ""}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  relationship_tag: e.target.value,
                })
              }
              style={{ width: "100%", marginBottom: 8 }}
            />

            {/* 生日 */}
            <input
              type="date"
              value={selected.birthday || ""}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  birthday: e.target.value,
                })
              }
              style={{ width: "100%", marginBottom: 8 }}
            />

            {/* 备注 */}
            <textarea
              placeholder="备注"
              value={selected.notes || ""}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  notes: e.target.value,
                })
              }
              style={{
                width: "100%",
                height: 100,
                marginBottom: 8,
              }}
            />

            {/* 保存 */}
            <button
              onClick={() => updatePerson(selected)}
              style={{ marginRight: 8 }}
            >
              保存
            </button>

            {/* 删除 */}
            <button
              onClick={() => {
                if (confirm("确定删除该人物？")) {
                  deletePerson(selected.id);
                  setSelected(null);
                }
              }}
              style={{ color: "red" }}
            >
              删除
            </button>
          </>
        )}
      </div>
    </div>
  );
}