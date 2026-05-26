"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Graph from "./graph";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [search, setSearch] = useState("");

  // =========================
  // 🔐 AUTH SYSTEM
  // =========================
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

  // =========================
  // 📦 LOAD DATA
  // =========================
  async function loadData(uid: string) {
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
  }

  // =========================
  // ➕ ADD PERSON
  // =========================
  async function addPerson() {
    if (!user) return;

    await supabase.from("people").insert([
      {
        owner_id: user.id,
        name: "新人物",
        relationship_tag: "朋友",
        notes: "",
        pos_x: Math.random() * 500,
        pos_y: Math.random() * 500,
      },
    ]);

    loadData(user.id);
  }

  // =========================
  // ✏️ UPDATE PERSON
  // =========================
  async function updatePerson(p: any) {
    await supabase
      .from("people")
      .update({
        name: p.name,
        notes: p.notes,
        relationship_tag: p.relationship_tag,
      })
      .eq("id", p.id);

    loadData(user.id);
  }

  // =========================
  // 🔗 SEARCH + ADD RELATION（重点）
  // =========================
  async function addRelation(from: string, to: string) {
    if (!user) return;

    // 防重复
    const exists = relations.find(
      (r) =>
        r.from_person_id === from &&
        r.to_person_id === to
    );

    if (exists) return;

    await supabase.from("relations").insert([
      {
        owner_id: user.id,
        from_person_id: from,
        to_person_id: to,
        relation_type: "关系",
        strength: 1,
      },
    ]);

    loadData(user.id);
  }

  // =========================
  // 📍 UPDATE POSITION
  // =========================
  async function updatePosition(id: string, x: number, y: number) {
    await supabase
      .from("people")
      .update({
        pos_x: x,
        pos_y: y,
      })
      .eq("id", id);
  }

  // =========================
  // 🔍 SEARCH PEOPLE
  // =========================
  const filteredPeople = people.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  // =========================
  // 🔐 LOGIN UI
  // =========================
  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>登录后进入社交图谱</h2>
      </div>
    );
  }

  // =========================
  // 🧠 MAIN UI
  // =========================
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: 300, padding: 10 }}>
        <h3>人物</h3>

        <input
          placeholder="搜索人物"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={addPerson}>+ 新增人物</button>

        {filteredPeople.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            style={{ padding: 6, cursor: "pointer" }}
          >
            {p.name}
          </div>
        ))}
      </div>

      {/* CENTER GRAPH */}
      <div style={{ flex: 1 }}>
        <Graph
          people={people}
          relations={relations}
          onNodeClick={(id: string) => {
            setSelected(people.find((p) => p.id === id));
          }}
          onConnectRelation={addRelation}
          onNodePositionChange={updatePosition}
        />
      </div>

      {/* RIGHT EDITOR */}
      <div style={{ width: 320, padding: 10 }}>
        {selected ? (
          <>
            <h3>编辑人物</h3>

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

            <input
              value={selected.relationship_tag}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  relationship_tag: e.target.value,
                })
              }
            />

            <button onClick={() => updatePerson(selected)}>
              保存
            </button>
          </>
        ) : (
          <p>点击节点编辑</p>
        )}
      </div>
    </div>
  );
}