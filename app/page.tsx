"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [people, setPeople] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");

  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [relationType, setRelationType] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      fetchPeople(user.id);
      fetchRelations(user.id);
    }
  }

  async function signIn() {
    const email = prompt("Email");
    const password = prompt("Password");

    if (!email || !password) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      location.reload();
    }
  }

  async function signUp() {
    const email = prompt("Email");
    const password = prompt("Password");

    if (!email || !password) return;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup success");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  async function fetchPeople(userId: string) {
    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    setPeople(data || []);
  }

  async function fetchRelations(userId: string) {
    const { data } = await supabase
      .from("relations")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    setRelations(data || []);
  }

  async function addPerson() {
    if (!user) return alert("Please login");

    const { error } = await supabase.from("people").insert([
      {
        owner_id: user.id,
        name,
        birthday,
        relationship_tag: tag,
        notes,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setName("");
      setBirthday("");
      setTag("");
      setNotes("");

      fetchPeople(user.id);
    }
  }

  async function deletePerson(id: string) {
    await supabase.from("people").delete().eq("id", id);

    fetchPeople(user.id);
  }

  async function addRelation() {
    if (!fromId || !toId) return;

    const { error } = await supabase.from("relations").insert([
      {
        owner_id: user.id,
        from_person_id: fromId,
        to_person_id: toId,
        relation_type: relationType,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      fetchRelations(user.id);
    }
  }

  async function deleteRelation(id: string) {
    await supabase.from("relations").delete().eq("id", id);

    fetchRelations(user.id);
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Social Graph</h1>

        <button onClick={signIn}>Login</button>

        <button onClick={signUp} style={{ marginLeft: 10 }}>
          Signup
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Social Graph CRM</h1>

      <button onClick={logout}>Logout</button>

      <hr />

      <h2>Add Person</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="date"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Tag (friend/work/classmate)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />

      <br />
      <br />

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <br />
      <br />

      <button onClick={addPerson}>Add Person</button>

      <hr />

      <h2>People</h2>

      {people.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <strong>{p.name}</strong>

          <p>Tag: {p.relationship_tag}</p>

          <p>Birthday: {p.birthday}</p>

          <p>Notes: {p.notes}</p>

          <button onClick={() => deletePerson(p.id)}>Delete</button>
        </div>
      ))}

      <hr />

      <h2>Add Relation</h2>

      <select onChange={(e) => setFromId(e.target.value)}>
        <option>From</option>

        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select onChange={(e) => setToId(e.target.value)}>
        <option>To</option>

        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        placeholder="Relation Type"
        value={relationType}
        onChange={(e) => setRelationType(e.target.value)}
      />

      <br />
      <br />

      <button onClick={addRelation}>Add Relation</button>

      <hr />

      <h2>Relations</h2>

      {relations.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid blue",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p>Relation Type: {r.relation_type}</p>

          <p>From: {r.from_person_id}</p>

          <p>To: {r.to_person_id}</p>

          <button onClick={() => deleteRelation(r.id)}>
            Delete Relation
          </button>
        </div>
      ))}
    </div>
  );
}