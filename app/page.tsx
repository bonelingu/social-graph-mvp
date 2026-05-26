"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase-client";
import Graph from "./graph";
import PersonSearchSelect from "./person-search-select";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");

  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);
  const [label, setLabel] = useState("");

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

  // =========================
  // PEOPLE EDIT (inline)
  // =========================

  async function updatePerson(id: string, field: string, value: any) {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );

    await supabase
      .from("people")
      .update({ [field]: value })
      .eq("id", id);
  }

  async function addPerson() {
    await supabase.from("people").insert([
      {
        owner_id: user.id,
        name,
        birthday: birthday || null,
        relationship_tag: tag || null,
        notes: notes || null,
      },
    ]);

    setName("");
    setBirthday("");
    setTag("");
    setNotes("");

    fetchPeople(user.id);
  }

  async function deletePerson(id: string) {
    await supabase.from("people").delete().eq("id", id);
    fetchPeople(user.id);
  }

  // =========================
  // RELATIONS
  // =========================

  async function createRelation() {
    if (!from || !to) return;

    await supabase.from("relations").insert([
      {
        owner_id: user.id,
        from_id: from.id,
        to_id: to.id,
        label: label || "related",
      },
    ]);

    setFrom(null);
    setTo(null);
    setLabel("");

    fetchRelations(user.id);
  }

  if (!user) return <div style={{ padding: 40 }}>login required</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>social graph</h1>

      {/* GRAPH */}
      <h2>graph</h2>
      <Graph people={people} relations={relations} />

      <hr />

      {/* ADD PERSON */}
      <h2>add person</h2>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" />
      <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag" />
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="notes" />

      <button onClick={addPerson}>add</button>

      <hr />

      {/* PEOPLE INLINE EDIT */}
      <h2>people (editable)</h2>

      {people.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: 10 }}>
          <input
            value={p.name}
            onChange={(e) =>
              updatePerson(p.id, "name", e.target.value)
            }
          />

          <input
            type="date"
            value={p.birthday || ""}
            onChange={(e) =>
              updatePerson(p.id, "birthday", e.target.value)
            }
          />

          <input
            value={p.relationship_tag || ""}
            onChange={(e) =>
              updatePerson(p.id, "relationship_tag", e.target.value)
            }
          />

          <textarea
            value={p.notes || ""}
            onChange={(e) =>
              updatePerson(p.id, "notes", e.target.value)
            }
          />

          <button onClick={() => deletePerson(p.id)}>
            delete
          </button>
        </div>
      ))}

      <hr />

      {/* RELATION */}
      <h2>create relation</h2>

      <div style={{ display: "flex", gap: 20 }}>
        <div>
          <p>from: {from?.name}</p>
          <PersonSearchSelect people={people} onSelect={setFrom} />
        </div>

        <div>
          <p>to: {to?.name}</p>
          <PersonSearchSelect people={people} onSelect={setTo} />
        </div>
      </div>

      <input
        placeholder="label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <button onClick={createRelation}>create relation</button>
    </div>
  );
}