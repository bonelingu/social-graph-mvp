"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePeople(userId: string | null) {
  const [people, setPeople] = useState<any[]>([]);

  async function load() {
    if (!userId) return;

    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", userId);

    setPeople(data || []);
  }

  async function addPerson() {
    if (!userId) return;

    await supabase.from("people").insert([
      {
        owner_id: userId,
        name: "新人物",
        pos_x: Math.random() * 500,
        pos_y: Math.random() * 500,
      },
    ]);

    load();
  }

  async function updatePerson(p: any) {
    await supabase
      .from("people")
      .update(p)
      .eq("id", p.id);

    load();
  }

  return { people, load, addPerson, updatePerson };
}