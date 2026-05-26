"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function Auth({ onLogin }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (data?.user) onLogin(data.user);
    if (error) alert(error.message);
  }

  return (
    <div>
      <input
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>登录</button>
    </div>
  );
}