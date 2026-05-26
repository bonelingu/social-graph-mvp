"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Graph from "./Graph";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);

    if (data.user) {
      fetchPeople(data.user.id);
      fetchRelations(data.user.id);
    }
  }

  async function fetchPeople(userId: string) {
    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", userId);

    setPeople(data || []);
  }

  async function fetchRelations(userId: string) {
    const { data } = await supabase
      .from("relations")
      .select("*")
      .eq("owner_id", userId);

    setRelations(data || []);
  }

  // ⭐ 直接编辑（关键）
  async function updateField(id: string, field: string, value: any) {
    await supabase
      .from("people")
      .update({ [field]: value })
      .eq("id", id);

    if (user?.id) fetchPeople(user.id);
  }

  async function deletePerson(id: string) {
    await supabase.from("people").delete().eq("id", id);
    if (user?.id) fetchPeople(user.id);
  }

  if (!user) {
    return <div style={{ padding: 40 }}>Login required</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Social Graph Pro</h1>

      {/* 图谱 */}
      <h2>Network Graph</h2>
      <Graph people={people} relations={relations} />

      <hr />

      {/* 表格编辑（核心升级） */}
      <h2>People (Editable)</h2>

      {people.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          {/* 名字直接可改 */}
          <input
            value={p.name}
            onChange={(e) =>
              updateField(p.id, "name", e.target.value)
            }
          />

          <br />

          <input
            type="date"
            value={p.birthday || ""}
            onChange={(e) =>
              updateField(p.id, "birthday", e.target.value)
            }
          />

          <br />

          <input
            value={p.relationship_tag || ""}
            placeholder="tag"
            onChange={(e) =>
              updateField(p.id, "relationship_tag", e.target.value)
            }
          />

          <br />

          <textarea
            value={p.notes || ""}
            onChange={(e) =>
              updateField(p.id, "notes", e.target.value)
            }
          />

          <br />

          <button onClick={() => deletePerson(p.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}