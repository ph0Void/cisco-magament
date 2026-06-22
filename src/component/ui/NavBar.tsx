"use client";

import React, { useState } from "react";
import { useCiscoSocket } from "@/hooks/useCiscoSocket";
import { RefreshCw, Radio, Cpu, User, Zap, Loader2 } from "lucide-react";
import ToggleTheme from "./ToggleTheme";

interface NavBarProps {
  username: string;
}

export default function NavBar({ username = "DEFAULT" }: NavBarProps) {
  const { status, refreshTopology, reconnect, isConnected, isReconnecting } = useCiscoSocket();
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = isReconnecting || refreshing || status === "connecting";

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTopology();
    setTimeout(() => setRefreshing(false), 800);
  };

  const handlePTBridgeClick = async () => {
    if (isConnected) {
      await handleRefresh();
    } else {
      await reconnect();
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Cpu className="w-5 h-5 text-primary" />
        <h2 className="text-md font-semibold text-foreground tracking-wide">
          Network Control Center
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* BOTÓN DE ESTADO GENERAL DE CONEXIÓN */}
        <button
          onClick={handlePTBridgeClick}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${isLoading && !isConnected
            ? "bg-amber-500/10 border-amber-500/20 text-amber-500 cursor-wait"
            : isConnected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
              : "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 animate-pulse"
            }`}
        >
          {isLoading && !isConnected ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isConnected ? (
            <Radio className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : "animate-pulse"}`} />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          <span>
            {isLoading && !isConnected
              ? "CONECTANDO..."
              : isConnected
                ? "CONECTADO"
                : "SIN CONEXION"}
          </span>
        </button>

        <div>
          <ToggleTheme />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border text-accent-foreground text-xs font-semibold tracking-wide">
            <User className="w-3.5 h-3.5" />
            <span>{username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}