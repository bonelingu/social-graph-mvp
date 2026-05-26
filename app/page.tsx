// app/page.tsx

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

  // ===== 添加人物 =====
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [relationshipTag, setRelationshipTag] =
    useState("");
  const [notes, setNotes] = useState("");

  // ===== 搜索关系 =====
  const [fromSearch, setFromSearch] =
    useState("");
  const [toSearch, setToSearch] = useState("");

  const [fromPerson, setFromPerson] =
    useState<any>(null);

  const [toPerson, setToPerson] =
    useState<any>(null);

  const [relationType, setRelationType] =
    useState("");

  // ===== 编辑 =====
  const [editing, setEditing] = useState(false);

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

  async function fetchPeople(uid: string) {
    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", uid);

    setPeople(data || []);
  }

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
        relationship_tag:
          relationshipTag,
        notes,

        pos_x:
          Math.random() * 600,

        pos_y:
          Math.random() * 400,
      },
    ]);

    setName("");
    setBirthday("");
    setRelationshipTag("");
    setNotes("");

    fetchPeople(user.id);
  }

  // ===== 编辑人物 =====
  async function updatePerson() {
    if (!selectedPerson) return;

    await supabase
      .from("people")
      .update({
        name:
          selectedPerson.name,

        birthday:
          selectedPerson.birthday,

        relationship_tag:
          selectedPerson.relationship_tag,

        notes:
          selectedPerson.notes,
      })
      .eq("id", selectedPerson.id);

    setEditing(false);

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

    await supabase
      .from("relations")
      .insert([
        {
          owner_id: user.id,

          from_person_id:
            fromPerson.id,

          to_person_id:
            toPerson.id,

          relation_type:
            relationType,

          strength: 1,
        },
      ]);

    setRelationType("");

    fetchRelations(user.id);
  }

  // ===== 拖拽创建关系 =====
  async function autoCreateRelation(
    source: string,
    target: string
  ) {
    await supabase
      .from("relations")
      .insert([
        {
          owner_id: user.id,

          from_person_id:
            source,

          to_person_id:
            target,

          relation_type: "认识",

          strength: 1,
        },
      ]);

    fetchRelations(user.id);
  }

  // ===== 保存位置 =====
  async function updateNodePosition(
    id: string,
    x: number,
    y: number
  ) {
    await supabase
      .from("people")
      .update({
        pos_x: x,
        pos_y: y,
      })
      .eq("id", id);
  }

  // ===== 搜索 =====
  const fromResults =
    people.filter((p) =>
      p.name.includes(fromSearch)
    );

  const toResults = people.filter((p) =>
    p.name.includes(toSearch)
  );

  if (!user) {
    return (
      <div
        style={{
          padding: 40,
        }}
      >
        请先登录
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      {/* 左侧 */}
      <div
        style={{
          width: 340,
          overflowY: "auto",
          padding: 20,
          borderRight:
            "1px solid #ddd",
          background: "white",
        }}
      >
        <h2>添加人物</h2>

        <input
          placeholder="姓名"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <input
          type="date"
          value={birthday}
          onChange={(e) =>
            setBirthday(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <input
          placeholder="关系标签"
          value={
            relationshipTag
          }
          onChange={(e) =>
            setRelationshipTag(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <textarea
          placeholder="备注"
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
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

        <hr
          style={{
            margin: "24px 0",
          }}
        />

        <h2>添加关系</h2>

        {/* 搜索 A */}
        <input
          placeholder="搜索人物A"
          value={fromSearch}
          onChange={(e) =>
            setFromSearch(
              e.target.value
            )
          }
          style={inputStyle}
        />

        {fromSearch &&
          fromResults.map((p) => (
            <div
              key={p.id}
              style={searchItem}
              onClick={() => {
                setFromPerson(p);

                setFromSearch(
                  p.name
                );
              }}
            >
              {p.name}
            </div>
          ))}

        {/* 搜索 B */}
        <input
          placeholder="搜索人物B"
          value={toSearch}
          onChange={(e) =>
            setToSearch(
              e.target.value
            )
          }
          style={inputStyle}
        />

        {toSearch &&
          toResults.map((p) => (
            <div
              key={p.id}
              style={searchItem}
              onClick={() => {
                setToPerson(p);

                setToSearch(
                  p.name
                );
              }}
            >
              {p.name}
            </div>
          ))}

        <input
          placeholder="关系类型"
          value={relationType}
          onChange={(e) =>
            setRelationType(
              e.target.value
            )
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

      {/* 中间图谱 */}
      <div
        style={{
          flex: 1,
          padding: 20,
        }}
      >
        <Graph
          people={people}
          relations={relations}

          onNodeClick={(
            id: string
          ) => {
            const person =
              people.find(
                (p) =>
                  p.id === id
              );

            setSelectedPerson(
              person
            );

            setEditing(false);
          }}

          onConnectRelation={
            autoCreateRelation
          }

          onNodePositionChange={
            updateNodePosition
          }
        />
      </div>

      {/* 右侧详情 */}
      <div
        style={{
          width: 320,
          background: "white",
          borderLeft:
            "1px solid #ddd",
          padding: 20,
        }}
      >
        {selectedPerson ? (
          <>
            {!editing ? (
              <>
                <h2>
                  {
                    selectedPerson.name
                  }
                </h2>

                <p>
                  <strong>
                    标签：
                  </strong>

                  {
                    selectedPerson.relationship_tag
                  }
                </p>

                <p>
                  <strong>
                    生日：
                  </strong>

                  {
                    selectedPerson.birthday
                  }
                </p>

                <p>
                  <strong>
                    备注：
                  </strong>

                  {
                    selectedPerson.notes
                  }
                </p>

                <button
                  style={
                    buttonStyle
                  }
                  onClick={() =>
                    setEditing(
                      true
                    )
                  }
                >
                  编辑
                </button>
              </>
            ) : (
              <>
                <input
                  value={
                    selectedPerson.name
                  }
                  onChange={(
                    e
                  ) =>
                    setSelectedPerson(
                      {
                        ...selectedPerson,
                        name:
                          e
                            .target
                            .value,
                      }
                    )
                  }
                  style={
                    inputStyle
                  }
                />

                <input
                  type="date"
                  value={
                    selectedPerson.birthday
                  }
                  onChange={(
                    e
                  ) =>
                    setSelectedPerson(
                      {
                        ...selectedPerson,
                        birthday:
                          e
                            .target
                            .value,
                      }
                    )
                  }
                  style={
                    inputStyle
                  }
                />

                <input
                  value={
                    selectedPerson.relationship_tag
                  }
                  onChange={(
                    e
                  ) =>
                    setSelectedPerson(
                      {
                        ...selectedPerson,
                        relationship_tag:
                          e
                            .target
                            .value,
                      }
                    )
                  }
                  style={
                    inputStyle
                  }
                />

                <textarea
                  value={
                    selectedPerson.notes
                  }
                  onChange={(
                    e
                  ) =>
                    setSelectedPerson(
                      {
                        ...selectedPerson,
                        notes:
                          e
                            .target
                            .value,
                      }
                    )
                  }
                  style={{
                    ...inputStyle,
                    height: 100,
                  }}
                />

                <button
                  style={
                    buttonStyle
                  }
                  onClick={
                    updatePerson
                  }
                >
                  保存
                </button>
              </>
            )}
          </>
        ) : (
          <div>
            点击节点查看详情
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const buttonStyle = {
  width: "100%",
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "black",
  color: "white",
  cursor: "pointer",
};

const searchItem = {
  padding: 10,
  background: "#f0f0f0",
  borderRadius: 8,
  marginTop: 4,
  cursor: "pointer",
};