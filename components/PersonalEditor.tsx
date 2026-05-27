"use client";

export default function PersonEditor({
  selected,
  setSelected,
  updatePerson,
  deletePerson,
}: any) {
  if (!selected) {
    return (
      <div style={{ padding: 20 }}>
        请选择人物
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>编辑人物</h3>

      <input
        value={selected.name || ""}
        placeholder="姓名"
        onChange={(e) =>
          setSelected({
            ...selected,
            name: e.target.value,
          })
        }
      />

      <br />
      <br />

      <input
        value={selected.relationship_tag || ""}
        placeholder="标签（朋友/同学）"
        onChange={(e) =>
          setSelected({
            ...selected,
            relationship_tag:
              e.target.value,
          })
        }
      />

      <br />
      <br />

      <input
        type="date"
        value={selected.birthday || ""}
        onChange={(e) =>
          setSelected({
            ...selected,
            birthday: e.target.value,
          })
        }
      />

      <br />
      <br />

      <textarea
        value={selected.notes || ""}
        placeholder="备注"
        onChange={(e) =>
          setSelected({
            ...selected,
            notes: e.target.value,
          })
        }
      />

      <br />
      <br />

      <button
        onClick={() =>
          updatePerson(selected)
        }
      >
        保存
      </button>

      <button
        onClick={() =>
          deletePerson(selected.id)
        }
      >
        删除
      </button>
    </div>
  );
}