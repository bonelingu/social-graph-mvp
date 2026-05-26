"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Graph from "./graph";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);

  const [name, setName] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("friend");

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

  // ===== 添加人 =====
  async function addPerson() {
    await supabase.from("people").insert([
      {
        owner_id: user.id,
        name,
      },
    ]);

    setName("");
    fetchPeople(user.id);
  }

  // ===== 添加关系（核心）=====
  async function addRelation() {
    await supabase.from("relations").insert([
      {
        owner_id: user.id,
        from_id: from,
        to_id: to,
        type,
      },
    ]);

    setFrom("");
    setTo("");
    fetchRelations(user.id);
  }

  if (!user) return <div>login required</div>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Social Graph</h1>

      {/* GRAPH */}
      <Graph people={people} relations={relations} />

      <hr />

      {/* ADD PERSON */}
      <h2>Add Person</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="name"
      />
      <button onClick={addPerson}>add</button>

      <hr />

      {/* ADD RELATION */}
      <h2>Add Relation</h2>

      <select value={from} onChange={(e) => setFrom(e.target.value)}>
        <option value="">from</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select value={to} onChange={(e) => setTo(e.target.value)}>
        <option value="">to</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="friend">friend</option>
        <option value="classmate">classmate</option>
        <option value="colleague">colleague</option>
      </select>

      <button onClick={addRelation}>add relation</button>

      <hr />

      {/* DEBUG */}
      <h3>people</h3>
      <pre>{JSON.stringify(people, null, 2)}</pre>

      <h3>relations</h3>
      <pre>{JSON.stringify(relations, null, 2)}</pre>
    </div>
  );
}