"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useRelations(userId: string | null) {
  const [relations, setRelations] = useState<any[]>([]);

  async function load() {
    if (!userId) return;

    const { data } = await supabase
      .from("relations")
      .select("*")
      .eq("owner_id", userId);

    setRelations(data || []);
  }

  async function addRelation(from: string, to: string) {
    if (!userId) return;

    const { data } = await supabase
      .from("relations")
      .insert([
        {
          owner_id: userId,
          from_person_id: from,
          to_person_id: to,
          relation_type: "关系",
        },
      ])
      .select()
      .single();

    setRelations((prev) => [...prev, data]);
  }

  async function updateRelation(id: string, type: string) {
    await supabase
      .from("relations")
      .update({ relation_type: type })
      .eq("id", id);

    load();
  }

  return { relations, load, addRelation, updateRelation };
}