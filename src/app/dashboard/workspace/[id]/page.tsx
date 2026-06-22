import React from "react";
import { getTopologyByIdAction } from "@/action/TopologyAction";
import WorkspaceContainer from "@/component/workspace/WorkspaceContainer";
import { notFound } from "next/navigation";

interface WorkspacePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkspacePageId({ params }: WorkspacePageProps) {
  const { id } = await params;
  const result = await getTopologyByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  let initialTopology = { devices: [], links: [] };
  if (result.data.topologyJson) {
    try {
      initialTopology = JSON.parse(result.data.topologyJson);
    } catch (e) {
      console.error("Error parsing topologyJson:", e);
    }
  }

  return (
    <WorkspaceContainer
      topologyId={id}
      initialName={result.data.name}
      initialDescription={result.data.description || ""}
      initialTopology={initialTopology}
    />
  );
}
