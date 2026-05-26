"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Graph from "./graph";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [people, setPeople] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);

  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // ========================
  // 🔐 登录系统（完整恢复）
  // ========================
  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user ?? null;

    setUser(u);

    if (u) loadData(u.id);

    supabase.auth.onAuthStateChange((_e, session) => {
      const u2 = session?.user ?? null;
      setUser(u2);

      if (u2) loadData(u2.id);
      else {
        setPeople([]);
        setRelations([]);
      }
    });
  }

  // ========================
  // 📦 数据加载（关键修复）
  // ========================
  async function loadData(uid: string) {
    setLoading(true);

    const { data: p } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", uid);

    const { data: r } = await supabase
      .from("relations")
      .select("*")
      .eq("owner_id", uid);

    setPeople(p || []);
    setRelations(r || []);

    setLoading(false);
  }

  // ========================
  // ➕ 添加人物
  // ========================
  async function addPerson() {
    if (!user) return;

    await supabase.from("people").insert([
      {
        owner_id: user.id,
        name: "新人物",
        relationship_tag: "朋友",
        pos_x: Math.random() * 400,
        pos_y: Math.random() * 400,
      },
    ]);

    loadData(user.id);
  }

  // ========================
  // ✏️ 更新人物
  // ========================
  async function updatePerson(p: any) {
    await supabase
      .from("people")
      .update({
        name: p.name,
        relationship_tag: p.relationship_tag,
        notes: p.notes,
      })
      .eq("id", p.id);

    loadData(user.id);
  }

  // ========================
  // 🔗 添加关系
  // ========================
  async function addRelation(a: string, b: string) {
    await supabase.from("relations").insert([
      {
        owner_id: user.id,
        from_person_id: a,
        to_person_id: b,
        relation_type: "认识",
        strength: 1,
      },
    ]);

    loadData(user.id);
  }

  // ========================
  // 📍 保存位置
  // ========================
  async function savePosition(id: string, x: number, y: number) {
    await supabase
      .from("people")
      .update({
        pos_x: x,
        pos_y: y,
      })
      .eq("id", id);
  }

  // ========================
  // 🔐 未登录
  // ========================
  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>请登录</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 左侧 */}
      <div style={{ width: 280, padding: 20 }}>
        <h3>人物</h3>

        {loading && <p>加载中...</p>}

        {people.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            style={{ padding: 8, cursor: "pointer" }}
          >
            {p.name}
          </div>
        ))}

        <button onClick={addPerson}>+ 添加</button>
      </div>

      {/* 中间 Graph */}
      <div style={{ flex: 1 }}>
        <Graph
          people={people}
          relations={relations}
          onNodeClick={(id: string) => {
            setSelected(
              people.find((p) => p.id === id)
            );
          }}
          onConnectRelation={addRelation}
          onNodePositionChange={savePosition}
        />
      </div>

      {/* 右侧 */}
      <div style={{ width: 300, padding: 20 }}>
        {selected ? (
          <>
            <h3>{selected.name}</h3>

            <input
              value={selected.name}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  name: e.target.value,
                })
              }
            />

            <textarea
              value={selected.notes || ""}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  notes: e.target.value,
                })
              }
            />

            <button onClick={() => updatePerson(selected)}>
              保存
            </button>
          </>
        ) : (
          <p>点击节点</p>
        )}
      </div>
    </div>
  );
}