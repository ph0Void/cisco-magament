"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Network, Radio, AlertTriangle } from "lucide-react";
import { useCiscoSocket } from "@/hooks/useCiscoSocket";
import WorkspaceContainer from "./WorkspaceContainer";

export default function WorkspaceIndexClient() {
  const { isConnected, refreshTopology, status } = useCiscoSocket();
  const [showLive, setShowLive] = useState(false);

  const handleConnectLive = async () => {
    if (isConnected) {
      await refreshTopology();
      setShowLive(true);
    }
  };

  if (showLive) {
    return <WorkspaceContainer />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-8 text-center text-foreground bg-background relative z-10">
      <div className="relative">
        <div className="rounded-full bg-muted p-5 border border-border shadow-inner">
          <Network className={`w-12 h-12 text-muted-foreground ${isConnected ? "animate-pulse text-sky-400" : ""}`} />
        </div>
        <div className={`absolute -bottom-1 -right-1 rounded-full w-4 h-4 border-2 border-background ${
          isConnected ? "bg-emerald-500" : "bg-rose-500"
        }`} />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">No hay topología cargada</h1>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {isConnected 
            ? "El puente de Cisco Packet Tracer está conectado. Haz clic en Conectar para visualizar tu red en tiempo real." 
            : "Por favor, selecciona una topología guardada o asegúrate de que el puente de Cisco Packet Tracer esté conectado."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2 min-w-[200px]">
        {isConnected ? (
          <Button 
            onClick={handleConnectLive} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            CONECTAR WORKSPACE LIVE
          </Button>
        ) : (
          <Button 
            disabled 
            variant="outline"
            className="border-rose-500/30 text-rose-500/70 bg-rose-500/5 font-semibold gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            CONEXIÓN PT NO DETECTADA
          </Button>
        )}
        
        <Button variant="outline" asChild className="cursor-pointer">
          <Link href="/dashboard/topology">Ver Topologías Guardadas</Link>
        </Button>
      </div>
    </div>
  );
}
