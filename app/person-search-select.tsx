"use client";

import { useState } from "react";

export default function PersonSearchSelect({
  people,
  onSelect,
}: any) {
  const [keyword, setKeyword] = useState("");

  const filtered = people.filter((p: any) =>
    p.name?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div style={{ border: "1px solid #ccc", padding: 8 }}>
      <input
        placeholder="search person..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <div style={{ maxHeight: 150, overflow: "auto" }}>
        {filtered.map((p: any) => (
          <div
            key={p.id}
            style={{
              padding: 6,
              cursor: "pointer",
              borderBottom: "1px solid #eee",
            }}
            onClick={() => onSelect(p)}
          >
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}