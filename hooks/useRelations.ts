"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export function useRelations(userId: string) {
  const [relations, setRelations] =
    useState<any[]>([]);

  // =========================
  // load
  // =========================
  async function load() {
    const { data } = await supabase
      .from("relations")
      .select("*")
      .eq("owner_id", userId);

    setRelations(data || []);
  }

  // =========================
  // add
  // =========================
  async function addRelation(
    from: string,
    to: string
  ) {
    // 避免自己连自己
    if (from === to) return;

    // 避免重复关系
    const exists = relations.find(
      (r) =>
        (r.from_person_id === from &&
          r.to_person_id === to) ||
        (r.from_person_id === to &&
          r.to_person_id === from)
    );

    if (exists) {
      alert("关系已存在");
      return;
    }

    await supabase
      .from("relations")
      .insert([
        {
          owner_id: userId,
          from_person_id: from,
          to_person_id: to,
          relation_type: "关系",
        },
      ]);

    await load();
  }

  // =========================
  // update
  // =========================
  async function updateRelation(
    id: string,
    type: string
  ) {
    await supabase
      .from("relations")
      .update({
        relation_type: type,
      })
      .eq("id", id);

    await load();
  }

  // =========================
  // delete
  // =========================
  async function deleteRelation(
    id: string
  ) {
    await supabase
      .from("relations")
      .delete()
      .eq("id", id);

    await load();
  }

  return {
    relations,
    load,
    addRelation,
    updateRelation,
    deleteRelation,
  };
}