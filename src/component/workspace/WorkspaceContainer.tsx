"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useTopologyStore } from "@/store/topologyStore";
import { useCiscoSocket } from "@/hooks/useCiscoSocket";
import CustomNetworkNode from "./CustomNetworkNode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveTopologyAction } from "@/action/TopologyAction";
import { useRouter } from "next/navigation";
import {
  Save,
  RefreshCw,
  Network,
  Radio,
  Zap,
  Loader2,
  Database,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface WorkspaceContainerProps {
  topologyId?: string;
  initialName?: string;
  initialDescription?: string;
  initialTopology?: {
    devices: any[];
    links: any[];
  };
}

const nodeTypes = {
  networkNode: CustomNetworkNode,
};

export default function WorkspaceContainer({
  topologyId,
  initialName = "",
  initialDescription = "",
  initialTopology,
}: WorkspaceContainerProps) {
  const router = useRouter();
  const { status, isConnected, refreshTopology, reconnect } = useCiscoSocket();

  const devices = useTopologyStore((s) => s.devices);
  const links = useTopologyStore((s) => s.links);
  const setTopology = useTopologyStore((s) => s.setTopology);
  const updateDeviceStatus = useTopologyStore((s) => s.updateDeviceStatus);

  // Dialog / Save form state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with saved topology if not connected to PT
  useEffect(() => {
    if (!isConnected && initialTopology && initialTopology.devices.length > 0) {
      setTopology({
        devices: initialTopology.devices,
        links: initialTopology.links,
      });
    }
  }, [initialTopology, isConnected, setTopology]);

  // Map Zustand store devices/links to React Flow nodes/edges
  const nodes = useMemo<Node[]>(() => {
    return devices.map((d) => ({
      id: d.id,
      type: "networkNode",
      position: { x: d.x, y: d.y },
      data: d as any,
    }));
  }, [devices]);

  const edges = useMemo<Edge[]>(() => {
    return links.map((l) => ({
      id: l.id,
      source: l.sourceDevice,
      target: l.targetDevice,
      animated: l.status !== "down",
      style: {
        stroke: l.status === "down" ? "#ef4444" : "#0ea5e9",
        strokeWidth: 2,
      },
    }));
  }, [links]);

  // Handle Dragging
  const onNodeDragStop = useCallback(
    (event: any, node: any) => {
      updateDeviceStatus(node.id, {
        x: node.position.x,
        y: node.position.y,
      });
    },
    [updateDeviceStatus]
  );

  const handleSaveTopology = async () => {
    if (!name.trim()) {
      toast.error("Por favor ingresa un nombre para la topología");
      return;
    }

    setIsSaving(true);
    try {
      const topologyJson = JSON.stringify({ devices, links });
      const result = await saveTopologyAction(name, description, topologyJson, topologyId);

      if (result.success) {
        toast.success(result.message || "Topología guardada con éxito");
        setIsSaveModalOpen(false);
        router.refresh();
        if (!topologyId && result.data?.id) {
          router.push(`/dashboard/workspace/${result.data.id}`);
        }
      } else {
        toast.error(result.message || "Error al guardar la topología");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al guardar la topología");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header bar */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/topology">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-xs">
              {name || "Nueva Topología"}
            </h1>
            {description && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold font-mono transition-all ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}
          >
            {isConnected ? (
              <>
                <Radio className="w-3 h-3 animate-pulse" />
                <span>ONLINE (PT)</span>
              </>
            ) : (
              <>
                <Database className="w-3 h-3" />
                <span>SQLITE LOCAL</span>
              </>
            )}
          </div>

          {/* Sync Button */}
          {isConnected && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => refreshTopology()}
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Sincronizar</span>
            </Button>
          )}

          {/* Save Button */}
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95"
            onClick={() => setIsSaveModalOpen(true)}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Guardar / Actualizar</span>
          </Button>
        </div>
      </header>

      {/* React Flow Container */}
      <div className="flex-1 w-full relative min-h-0 bg-muted/10 dark:bg-muted/5">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeDragStop={onNodeDragStop}
          fitView
          minZoom={0.2}
          maxZoom={2}
          className="w-full h-full"
        >
          <Background color="currentColor" className="text-muted-foreground/15" gap={16} size={1} />
          <Controls className="!bg-card !border-border !text-foreground" />
          <MiniMap
            nodeColor={() => "var(--primary)"}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="!bg-card !border-border dark:!bg-slate-950"
          />
        </ReactFlow>
      </div>

      {/* Save Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar Topología</DialogTitle>
            <DialogDescription>
              Guarda el estado actual del diagrama de red en la base de datos SQLite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Nombre de la Topología</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Topología de Laboratorio 1"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-semibold text-muted-foreground">Descripción</label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente la configuración de red..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTopology} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Confirmar Guardado"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
