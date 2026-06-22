"use client";

import React, { useCallback, useState } from "react";
import { useCiscoChat } from "@/hooks/useCiscoChat";
import { toast } from "sonner";

// AI Elements
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
    ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
    Message,
    MessageContent,
    MessageResponse,
    MessageActions,
    MessageAction,
} from "@/components/ai-elements/message";
import {
    PromptInput,
    PromptInputBody,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputSubmit,
    PromptInputHeader,
    PromptInputButton,
    PromptInputActionMenu,
    PromptInputActionMenuTrigger,
    PromptInputActionMenuContent,
    PromptInputActionAddAttachments,
    usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";

// Shadcn UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
    Network,
    Bot,
    User,
    Copy,
    Check,
    ImageIcon,
    X,
    WrenchIcon,
    Activity,
    CheckCircle2,
    ShieldAlert,
    XCircle,
    Terminal,
    ChevronDown,
    Plus,
    Cpu,
    AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ToolExecution } from "@/hooks/useCiscoChat";



// ── Tool Status Renderer ────────────────────────────────────────────
const TOOL_STATUS_CONFIG = {
    running: {
        icon: Activity,
        iconClass: "text-amber-500 dark:text-amber-400 animate-pulse",
        borderClass: "border-amber-500/20 dark:border-amber-400/15",
        bgClass: "bg-amber-50/50 dark:bg-amber-950/10",
        badgeVariant:
            "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-400/20",
        label: "Ejecutando",
        description: "Inyectando comando a Cisco Packet Tracer…",
    },
    completed: {
        icon: CheckCircle2,
        iconClass: "text-emerald-500 dark:text-emerald-400",
        borderClass: "border-emerald-500/20 dark:border-emerald-400/15",
        bgClass: "bg-emerald-50/50 dark:bg-emerald-950/10",
        badgeVariant:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/20",
        label: "Completada",
        description: "Herramienta ejecutada con éxito",
    },
    waiting_approval: {
        icon: ShieldAlert,
        iconClass: "text-orange-500 dark:text-orange-400 animate-pulse",
        borderClass: "border-orange-500/25 dark:border-orange-400/20",
        bgClass: "bg-orange-50/50 dark:bg-orange-950/10",
        badgeVariant:
            "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-400/20",
        label: "Requiere autorización",
        description: "Cambio crítico pendiente de aprobación manual",
    },
    rejected: {
        icon: XCircle,
        iconClass: "text-destructive dark:text-red-400",
        borderClass: "border-destructive/20",
        bgClass: "bg-destructive/5",
        badgeVariant:
            "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-400/20",
        label: "Rechazada",
        description: "Acción abortada por el administrador",
    },
} as const;

interface ToolCardInlineProps {
    tool: ToolExecution;
    msgId: string;
    onAction: (msgId: string, toolId: string, action: "approve" | "reject") => void;
}

export default function ToolCardInline({ tool, msgId, onAction }: ToolCardInlineProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const cfg = TOOL_STATUS_CONFIG[tool.status];
    const Icon = cfg.icon;

    return (
        <>
            <div
                className={cn(
                    "rounded-xl border transition-colors duration-200 overflow-hidden text-xs",
                    cfg.borderClass,
                    cfg.bgClass
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2.5 select-none">
                    <div className="flex items-center gap-2.5">
                        <Icon size={13} className={cfg.iconClass} />
                        <WrenchIcon size={12} className="text-muted-foreground" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wide">
                                    {tool.name}
                                </span>
                                <span
                                    className={cn(
                                        "text-[9px] px-1.5 py-0.5 rounded-full border font-medium",
                                        cfg.badgeVariant
                                    )}
                                >
                                    {cfg.label}
                                </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                {cfg.description}
                            </span>
                        </div>
                    </div>

                    <button
                        id={`btn-tool-expand-${tool.id}`}
                        onClick={() => setIsExpanded((v) => !v)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 shrink-0"
                    >
                        <ChevronDown
                            size={13}
                            className={cn(
                                "transition-transform duration-200",
                                isExpanded ? "rotate-180" : ""
                            )}
                        />
                    </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
                        {tool.input && (
                            <div>
                                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                                    <Terminal size={9} />
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
                                    <CheckCircle2 size={9} />
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

                {/* Approval strip */}
                {tool.status === "waiting_approval" && (
                    <div className="px-3 py-2.5 border-t border-orange-500/20 dark:border-orange-400/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <p className="text-[10px] text-muted-foreground leading-snug flex items-center gap-1.5">
                            <AlertTriangle size={10} className="text-orange-500 shrink-0" />
                            ¿Confirmas la inyección de este comando en tu topología activa?
                        </p>
                        <div className="flex gap-2 shrink-0">
                            <Button
                                id={`btn-tool-reject-${tool.id}`}
                                size="sm"
                                variant="ghost"
                                onClick={() => onAction(msgId, tool.id, "reject")}
                                className="h-6 text-[10px] px-2.5"
                            >
                                Rechazar
                            </Button>
                            <Button
                                id={`btn-tool-approve-${tool.id}`}
                                size="sm"
                                onClick={() => setShowDialog(true)}
                                className="h-6 text-[10px] px-2.5 bg-orange-600 hover:bg-orange-500 text-white border-0"
                            >
                                Autorizar
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm">
                            <ShieldAlert size={15} className="text-orange-500" />
                            Confirmar Autorización
                        </DialogTitle>
                        <DialogDescription className="text-xs leading-relaxed">
                            Estás a punto de ejecutar{" "}
                            <code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono text-foreground">
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
                            className="h-7 text-xs"
                            onClick={() => setShowDialog(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            id={`btn-tool-confirm-${tool.id}`}
                            size="sm"
                            className="h-7 text-xs bg-orange-600 hover:bg-orange-500 text-white border-0"
                            onClick={() => {
                                onAction(msgId, tool.id, "approve");
                                setShowDialog(false);
                            }}
                        >
                            Confirmar Ejecución
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}