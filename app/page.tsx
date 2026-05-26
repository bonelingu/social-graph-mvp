"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Graph from "./graph";
import PersonSearchSelect from "./PersonSearchSelect";

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
  const [relationLabel, setRelationLabel] = useState("");

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

  // =====================
  // PEOPLE INLINE EDIT
  // =====================

  async function updatePerson(id: string, field: string, value: any) {
    await supabase
      .from("people")
      .update({ [field]: value })
      .eq("id", id);

    if (user?.id) fetchPeople(user.id);
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

  // =====================
  // RELATION
  // =====================

  async function createRelation() {
    if (!from || !to) return;

    await supabase.from("relations").insert([
      {
        owner_id: user.id,
        from_id: from.id,
        to_id: to.id,
        label: relationLabel || "related",
      },
    ]);

    setFrom(null);
    setTo(null);
    setRelationLabel("");

    fetchRelations(user.id);
  }

  async function updateRelationLabel(id: string, value: string) {
    await supabase
      .from("relations")
      .update({ label: value })
      .eq("id", id);

    fetchRelations(user.id);
  }

  if (!user) {
    return <div style={{ padding: 40 }}>Login required</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Social Graph Pro</h1>

      {/* GRAPH */}
      <h2>Graph</h2>
      <Graph people={people} relations={relations} />

      <hr />

      {/* CREATE PERSON */}
      <h2>Add Person</h2>

      <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      <input placeholder="tag" value={tag} onChange={(e) => setTag(e.target.value)} />
      <input placeholder="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <button onClick={addPerson}>Add</button>

      <hr />

      {/* PEOPLE INLINE EDIT */}
      <h2>People (Inline Editable)</h2>

      {people.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: 10 }}>
          <input
            value={p.name}
            onChange={(e) => updatePerson(p.id, "name", e.target.value)}
          />

          <input
            type="date"
            value={p.birthday || ""}
            onChange={(e) => updatePerson(p.id, "birthday", e.target.value)}
          />

          <input
            value={p.relationship_tag || ""}
            onChange={(e) => updatePerson(p.id, "relationship_tag", e.target.value)}
          />

          <textarea
            value={p.notes || ""}
            onChange={(e) => updatePerson(p.id, "notes", e.target.value)}
          />

          <button onClick={() => deletePerson(p.id)}>Delete</button>
        </div>
      ))}

      <hr />

      {/* RELATION SEARCH */}
      <h2>Create Relation</h2>

      <div style={{ display: "flex", gap: 20 }}>
        <div>
          <p>From: {from?.name || "-"}</p>
          <PersonSearchSelect people={people} onSelect={setFrom} />
        </div>

        <div>
          <p>To: {to?.name || "-"}</p>
          <PersonSearchSelect people={people} onSelect={setTo} />
        </div>
      </div>

      <input
        placeholder="relation label"
        value={relationLabel}
        onChange={(e) => setRelationLabel(e.target.value)}
      />

      <button onClick={createRelation}>Create Relation</button>

      <hr />

      {/* RELATIONS LIST */}
      <h2>Relations</h2>

      {relations.map((r) => (
        <div key={r.id}>
          <span>{r.from_id} → {r.to_id}</span>

          <input
            value={r.label || ""}
            onChange={(e) => updateRelationLabel(r.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}