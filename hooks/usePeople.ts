"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePeople(userId: string) {
  const [people, setPeople] = useState<any[]>([]);

  // =========================
  // 读取
  // =========================
  async function load() {
    if (!userId) return;

    const { data, error } = await supabase
      .from("people")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPeople(data || []);
  }

  // =========================
  // 添加（🔥修复重点）
  // =========================
  async function addPerson() {
    if (!userId) return;

    const newPerson = {
      owner_id: userId,

      name: "新人物",

      relationship_tag: "",

      birthday: null,

      notes: "",

      company: "",

      city: "",

      pos_x: Math.random() * 500,

      pos_y: Math.random() * 500,
    };

    // ✅ 1. 等待 insert 完成
    const { data, error } = await supabase
      .from("people")
      .insert(newPerson)
      .select(); // 🔥关键：返回新数据

    if (error) {
      console.error("addPerson error:", error);
      return;
    }

    console.log("新增成功:", data);

    // ✅ 2. 直接更新本地 state（比 reload 更稳定）
    if (data && data.length > 0) {
      setPeople((prev) => [
        data[0],
        ...prev,
      ]);
    } else {
      // fallback
      await load();
    }
  }

  // =========================
  // 更新
  // =========================
  async function updatePerson(p: any) {
    if (!p?.id) return;

    const { error } = await supabase
      .from("people")
      .update({
        name: p.name,
        relationship_tag:
          p.relationship_tag,
        birthday: p.birthday,
        notes: p.notes,
        company: p.company,
        city: p.city,
      })
      .eq("id", p.id);

    if (error) {
      console.error(error);
      return;
    }

    await load();
  }

  // =========================
  // 删除
  // =========================
  async function deletePerson(id: string) {
    if (!id) return;

    await supabase
      .from("people")
      .delete()
      .eq("id", id);

    // 删除关系
    await supabase
      .from("relations")
      .delete()
      .or(
        `from_person_id.eq.${id},to_person_id.eq.${id}`
      );

    await load();
  }

  return {
    people,
    load,
    addPerson,
    updatePerson,
    deletePerson,
  };
}