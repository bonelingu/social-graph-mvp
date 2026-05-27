"use client";

import { useEffect, useState } from "react";

import Graph from "@/components/Graph";

import Auth from "@/components/Auth";

import { useAuth } from "@/hooks/useAuth";

import { usePeople } from "@/hooks/usePeople";

import { useRelations } from "@/hooks/useRelations";

export default function Page() {
  const { user } = useAuth();

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
  // 当前选中人物
  // =========================
  const [selected, setSelected] =
    useState<any>(null);

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
  // 未登录
  // =========================
  if (!user) {
    return <Auth />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      {/* ========================= */}
      {/* 左侧人物列表 */}
      {/* ========================= */}

      <div
        style={{
          width: 280,
          borderRight:
            "1px solid #ddd",

          padding: 16,

          overflow: "auto",
        }}
      >
        <h2>人物</h2>

        <button onClick={addPerson}>
          + 添加人物
        </button>

        <div
          style={{
            marginTop: 20,
          }}
        >
          {people.map((p: any) => (
            <div
              key={p.id}
              onClick={() =>
                setSelected(p)
              }
              style={{
                padding: 10,
                marginBottom: 10,

                border:
                  selected?.id === p.id
                    ? "2px solid blue"
                    : "1px solid #ddd",

                borderRadius: 10,

                cursor: "pointer",
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
                {p.relationship_tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* 中间图谱 */}
      {/* ========================= */}

      <div
        style={{
          flex: 1,
        }}
      >
        <Graph
          people={people}
          relations={relations}
          onConnectRelation={
            addRelation
          }
          onUpdateRelation={
            updateRelation
          }
          onDeleteRelation={
            deleteRelation
          }
          onSelectPerson={setSelected}
        />
      </div>

      {/* ========================= */}
      {/* 右侧编辑器 */}
      {/* ========================= */}

      <div
        style={{
          width: 320,

          borderLeft:
            "1px solid #ddd",

          padding: 20,

          overflow: "auto",
        }}
      >
        {selected ? (
          <>
            <h2>编辑人物</h2>

            {/* 姓名 */}
            <div>
              <div>姓名</div>

              <input
                value={
                  selected.name || ""
                }
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    name:
                      e.target.value,
                  })
                }
              />
            </div>

            <br />

            {/* 标签 */}
            <div>
              <div>标签</div>

              <input
                value={
                  selected.relationship_tag ||
                  ""
                }
                placeholder="朋友 / 同学 / 家人"

                onChange={(e) =>
                  setSelected({
                    ...selected,
                    relationship_tag:
                      e.target.value,
                  })
                }
              />
            </div>

            <br />

            {/* 生日 */}
            <div>
              <div>生日</div>

              <input
                type="date"
                value={
                  selected.birthday ||
                  ""
                }
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    birthday:
                      e.target.value,
                  })
                }
              />
            </div>

            <br />

            {/* 备注 */}
            <div>
              <div>备注</div>

              <textarea
                rows={6}
                value={
                  selected.notes || ""
                }
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    notes:
                      e.target.value,
                  })
                }
              />
            </div>

            <br />

            {/* 保存 */}
            <button
              onClick={() =>
                updatePerson(
                  selected
                )
              }
            >
              保存修改
            </button>

            {/* 删除 */}
            <button
              style={{
                marginLeft: 10,
                color: "red",
              }}
              onClick={() => {
                const ok =
                  confirm(
                    "确定删除？"
                  );

                if (ok) {
                  deletePerson(
                    selected.id
                  );

                  setSelected(
                    null
                  );
                }
              }}
            >
              删除人物
            </button>
          </>
        ) : (
          <div>
            点击人物开始编辑
          </div>
        )}
      </div>
    </div>
  );
}