"use client";

import Auth from "@/components/Auth";
import Graph from "@/components/Graph";
import { useAuth } from "@/hooks/useAuth";
import { usePeople } from "@/hooks/usePeople";
import { useRelations } from "@/hooks/useRelations";

export default function Page() {
  const { user } = useAuth();

  const {
    people,
    load: loadPeople,
    addPerson,
    updatePerson,
  } = usePeople(user?.id);

  const {
    relations,
    load: loadRelations,
    addRelation,
    updateRelation,
  } = useRelations(user?.id);

  if (!user) {
    return <Auth onLogin={() => {}} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 250 }}>
        <button onClick={addPerson}>+ 人物</button>
      </div>

      <div style={{ flex: 1 }}>
        <Graph
          people={people}
          relations={relations}
          onConnectRelation={addRelation}
          onUpdateRelation={updateRelation}
          onNodePositionChange={() => {}}
        />
      </div>
    </div>
  );
}