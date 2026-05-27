"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  async function login() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    }
  }

  async function signup() {
    const { error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    } else {
      alert("注册成功");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Social Graph 登录</h2>

      <input
        placeholder="邮箱"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="密码"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={login}>
        登录
      </button>

      <button onClick={signup}>
        注册
      </button>
    </div>
  );
}