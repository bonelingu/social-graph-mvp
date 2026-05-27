"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePeople(userId: string) {
  const [people, setPeople] = useState<any[]>([]);

  async function load() {
    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", userId);

    setPeople(data || []);
  }

  async function addPerson() {
    await supabase.from("people").insert([
      {
        owner_id: userId,
        name: "新人物",
        relationship_tag: "",
        notes: "",
        pos_x: Math.random() * 500,
        pos_y: Math.random() * 500,
      },
    ]);

    load();
  }

  async function updatePerson(p: any) {
    await supabase
      .from("people")
      .update({
        name: p.name,
        notes: p.notes,
        birthday: p.birthday,
        relationship_tag:
          p.relationship_tag,
      })
      .eq("id", p.id);

    load();
  }

  async function deletePerson(id: string) {
    await supabase
      .from("people")
      .delete()
      .eq("id", id);

    // 删除关联关系
    await supabase
      .from("relations")
      .delete()
      .or(
        `from_person_id.eq.${id},to_person_id.eq.${id}`
      );

    load();
  }

  return {
    people,
    load,
    addPerson,
    updatePerson,
    deletePerson,
  };
}