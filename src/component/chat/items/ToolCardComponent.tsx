"use client";

import { useState } from "react";
import type { ToolExecution } from "@/hooks/useCiscoChat";
import {
  Activity,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  ChevronDown,
  Terminal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  running: {
    icon: Activity,
    iconClass: "text-amber-500 dark:text-amber-400 animate-pulse",
    borderClass: "border-amber-500/20 dark:border-amber-400/15",
    bgClass: "bg-amber-50/50 dark:bg-amber-950/10",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-400/20",
    label: "Ejecutando",
    description: "Inyectando comando a Cisco Packet Tracer…",
  },
  completed: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500 dark:text-emerald-400",
    borderClass: "border-emerald-500/20 dark:border-emerald-400/15",
    bgClass: "bg-emerald-50/50 dark:bg-emerald-950/10",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/20",
    label: "Completada",
    description: "Herramienta ejecutada con éxito",
  },
  waiting_approval: {
    icon: ShieldAlert,
    iconClass: "text-orange-500 dark:text-orange-400 animate-pulse",
    borderClass: "border-orange-500/25 dark:border-orange-400/20",
    bgClass: "bg-orange-50/50 dark:bg-orange-950/10",
    badgeClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-400/20",
    label: "Requiere autorización",
    description: "Cambio crítico pendiente de aprobación manual",
  },
  rejected: {
    icon: XCircle,
    iconClass: "text-destructive dark:text-red-400",
    borderClass: "border-destructive/20",
    bgClass: "bg-destructive/5",
    badgeClass:
      "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-400/20",
    label: "Rechazada",
    description: "Acción abortada por el administrador",
  },
} as const;

/* ── Props ──────────────────────────────────────────────────── */
interface ToolCardProps {
  tool: ToolExecution;
  msgId: string;
  onAction: (msgId: string, toolId: string, action: "approve" | "reject") => void;
}

/* ── Componente principal ───────────────────────────────────── */
export function ToolStatusCard({ tool, msgId, onAction }: ToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const cfg = STATUS_CONFIG[tool.status];
  const Icon = cfg.icon;

  return (
    <>
      <div
        className={`rounded-xl border transition-colors duration-200 overflow-hidden bg-card ${cfg.borderClass} ${cfg.bgClass}`}
      >
        {/* ── Cabecera ───────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2.5 select-none">
          <div className="flex items-center gap-2.5">
            <Icon size={14} className={cfg.iconClass} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wide">
                  {tool.name}
                </span>
                <Badge className={`text-[9px] px-1.5 py-0 border ${cfg.badgeClass}`}>
                  {cfg.label}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {cfg.description}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 shrink-0"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ── Detalles expandidos ────────────────────────── */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
            {tool.input && (
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Terminal size={10} />
                  Argumentos
                </p>
                <pre className="p-2.5 rounded-lg bg-muted border border-border text-[10px] font-mono text-cyan-600 dark:text-cyan-400 overflow-x-auto leading-relaxed">
                  {JSON.stringify(tool.input, null, 2)}
                </pre>
              </div>
            )}
            {tool.output && (
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={10} />
                  Respuesta Packet Tracer
                </p>
                <pre className="p-2.5 rounded-lg bg-muted border border-border text-[10px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto leading-relaxed">
                  {typeof tool.output === "string"
                    ? tool.output
                    : JSON.stringify(tool.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ── Franja de autorización ─────────────────────── */}
        {tool.status === "waiting_approval" && (
          <div className="px-3 py-2.5 border-t border-orange-500/20 dark:border-orange-400/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <p className="text-xs text-muted-foreground leading-snug">
              ¿Confirmas la inyección de este comando en tu topología activa?
            </p>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAction(msgId, tool.id, "reject")}
                className="h-7 text-xs px-3"
              >
                Rechazar
              </Button>
              <Button
                size="sm"
                onClick={() => setShowDialog(true)}
                className="h-7 text-xs px-3 bg-orange-600 hover:bg-orange-500 text-white border-0"
              >
                Autorizar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialog de confirmación ─────────────────────────── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldAlert size={16} className="text-orange-500" />
              Confirmar Autorización
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Estás a punto de ejecutar{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">
                {tool.name}
              </code>{" "}
              en tu topología activa de Packet Tracer. Esta acción puede ser
              irreversible.
            </DialogDescription>
          </DialogHeader>

          {tool.input && (
            <pre className="rounded-lg bg-muted border border-border p-2.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 overflow-x-auto max-h-36">
              {JSON.stringify(tool.input, null, 2)}
            </pre>
          )}

          <DialogFooter className="gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onAction(msgId, tool.id, "approve");
                setShowDialog(false);
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white border-0"
            >
              Confirmar Ejecución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}