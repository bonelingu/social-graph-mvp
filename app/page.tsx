"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then(m => m.default),
  { ssr: false }
);

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [relations, setRelations] = useState<any[]>([]);

  // ======================
  // AUTH
  // ======================
  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Check your email to confirm login");
  };

  const signIn = async () => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) return alert(error.message);

    setUser(data.user);
    loadData(data.user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRelations([]);
  };

  // ======================
  // LOAD DATA (IMPORTANT)
  // ======================
  const loadData = async (uid: string) => {
    const { data, error } = await supabase
      .from("relations")
      .select("*")
      .eq("user_id", uid);

    if (error) console.log(error);
    setRelations(data || []);
  };

  // ======================
  // INIT SESSION
  // ======================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        loadData(data.user.id);
      }
    });
  }, []);

  // ======================
  // ADD RELATION
  // ======================
  const addRelation = async () => {
    if (!user) return;
    if (!from || !to) return;

    const { error } = await supabase.from("relations").insert([
      {
        user_id: user.id,
        from_name: from,
        to_name: to,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setFrom("");
      setTo("");
      loadData(user.id);
    }
  };

  // ======================
  // DELETE
  // ======================
  const remove = async (id: string) => {
    const { error } = await supabase
      .from("relations")
      .delete()
      .eq("id", id);

    if (!error && user) {
      loadData(user.id);
    }
  };

  // ======================
  // GRAPH DATA
  // ======================
  const graphData = {
    nodes: Array.from(
      new Set(relations.flatMap(r => [r.from_name, r.to_name]))
    ).map(name => ({ id: name })),

    links: relations.map(r => ({
      source: r.from_name,
      target: r.to_name,
    })),
  };

  // ======================
  // LOGIN PAGE
  // ======================
  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Login</h1>

        <input
          placeholder="email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="password"
          type="password"
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={signUp}>Sign Up</button>
        <button onClick={signIn}>Login</button>
      </div>
    );
  }

  // ======================
  // MAIN APP
  // ======================
  return (
    <div style={{ padding: 40 }}>
      <h1>Social Graph 🚀</h1>

      <p>Logged in: {user.email}</p>

      <button onClick={logout}>Logout</button>

      <hr />

      <h2>Add Relation</h2>

      <input
        placeholder="From (Alice)"
        value={from}
        onChange={e => setFrom(e.target.value)}
      />

      <input
        placeholder="To (Bob)"
        value={to}
        onChange={e => setTo(e.target.value)}
      />

      <button onClick={addRelation}>Add</button>

      <h2>My Graph</h2>

      {relations.map(r => (
        <div key={r.id}>
          {r.from_name} → {r.to_name}
          <button onClick={() => remove(r.id)}>Delete</button>
        </div>
      ))}

      <h2>Graph View</h2>

      <div style={{ height: 600 }}>
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="id"
        />
      </div>
    </div>
  );
}