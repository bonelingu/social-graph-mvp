"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Graph from "./graph";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [people, setPeople] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);

  const [selectedPerson, setSelectedPerson] =
    useState<any>(null);

  // ===== 人物表单 =====
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [relationshipTag, setRelationshipTag] =
    useState("");
  const [notes, setNotes] = useState("");

  // ===== 关系表单 =====
  const [fromPerson, setFromPerson] = useState("");
  const [toPerson, setToPerson] = useState("");
  const [relationType, setRelationType] =
    useState("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      fetchPeople(user.id);
      fetchRelations(user.id);
    }
  }

  // ===== 获取人物 =====
  async function fetchPeople(uid: string) {
    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", uid)
      .order("created_at", { ascending: false });

    setPeople(data || []);
  }

  // ===== 获取关系 =====
  async function fetchRelations(uid: string) {
    const { data } = await supabase
      .from("relations")
      .select("*")
      .eq("owner_id", uid);

    setRelations(data || []);
  }

  // ===== 添加人物 =====
  async function addPerson() {
    if (!name) return;

    await supabase.from("people").insert([
      {
        owner_id: user.id,
        name,
        birthday,
        relationship_tag: relationshipTag,
        notes,
      },
    ]);

    setName("");
    setBirthday("");
    setRelationshipTag("");
    setNotes("");

    fetchPeople(user.id);
  }

  // ===== 添加关系 =====
  async function addRelation() {
    if (
      !fromPerson ||
      !toPerson ||
      !relationType
    )
      return;

    await supabase.from("relations").insert([
      {
        owner_id: user.id,
        from_person_id: fromPerson,
        to_person_id: toPerson,
        relation_type: relationType,
        strength: 1,
      },
    ]);

    setFromPerson("");
    setToPerson("");
    setRelationType("");

    fetchRelations(user.id);
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        请先登录 Supabase
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          marginBottom: 20,
        }}
      >
        Social Graph
      </h1>

      {/* 图谱 */}
      <Graph
        people={people}
        relations={relations}
        onNodeClick={(id: string) => {
          const person = people.find(
            (p) => p.id === id
          );

          setSelectedPerson(person);
        }}
      />

      {/* 人物详情 */}
      {selectedPerson && (
        <div
          style={{
            marginTop: 20,
            background: "white",
            padding: 20,
            borderRadius: 16,
            border: "1px solid #ddd",
          }}
        >
          <h2>{selectedPerson.name}</h2>

          <p>
            <strong>关系标签：</strong>
            {selectedPerson.relationship_tag ||
              "暂无"}
          </p>

          <p>
            <strong>生日：</strong>
            {selectedPerson.birthday || "未知"}
          </p>

          <p>
            <strong>备注：</strong>
            {selectedPerson.notes || "暂无"}
          </p>
        </div>
      )}

      {/* 添加人物 */}
      <div
        style={{
          marginTop: 30,
          background: "white",
          padding: 20,
          borderRadius: 16,
          border: "1px solid #ddd",
        }}
      >
        <h2>添加人物</h2>

        <input
          placeholder="姓名"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="date"
          value={birthday}
          onChange={(e) =>
            setBirthday(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="关系标签"
          value={relationshipTag}
          onChange={(e) =>
            setRelationshipTag(e.target.value)
          }
          style={inputStyle}
        />

        <textarea
          placeholder="备注"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          style={{
            ...inputStyle,
            height: 80,
          }}
        />

        <button
          onClick={addPerson}
          style={buttonStyle}
        >
          添加人物
        </button>
      </div>

      {/* 添加关系 */}
      <div
        style={{
          marginTop: 30,
          background: "white",
          padding: 20,
          borderRadius: 16,
          border: "1px solid #ddd",
        }}
      >
        <h2>添加关系</h2>

        <select
          value={fromPerson}
          onChange={(e) =>
            setFromPerson(e.target.value)
          }
          style={inputStyle}
        >
          <option value="">选择人物A</option>

          {people.map((p) => (
            <option
              key={p.id}
              value={p.id}
            >
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={toPerson}
          onChange={(e) =>
            setToPerson(e.target.value)
          }
          style={inputStyle}
        >
          <option value="">选择人物B</option>

          {people.map((p) => (
            <option
              key={p.id}
              value={p.id}
            >
              {p.name}
            </option>
          ))}
        </select>

        <input
          placeholder="关系，例如：高中同学"
          value={relationType}
          onChange={(e) =>
            setRelationType(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={addRelation}
          style={buttonStyle}
        >
          添加关系
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
  border: "1px solid #ccc",
};

const buttonStyle = {
  marginTop: 16,
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  background: "black",
  color: "white",
  cursor: "pointer",
};