"use client";

import React from "react";
import { formatDate } from "@/utils/FormatDate";
import { Edit2, Trash2, Check, Clock, Database } from "lucide-react";
import { solveAlertAction } from "@/action/AlertAction";
import { toast } from "sonner";

interface AlertItemsProps {
    alert: any;
    userRole: string;
    onEdit: (alert: any) => void;
    onDelete: (id: string) => void;
}

export default function AlertItems({ alert, userRole, onEdit, onDelete }: AlertItemsProps) {
    let severityStyle = "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400";

    if (alert.severity.toUpperCase() === "CRITICAL") {
        severityStyle = "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
    } else if (alert.severity.toUpperCase() === "WARNING") {
        severityStyle = "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-500";
    }

    const handleResolve = async () => {
        try {
            const res = await solveAlertAction(alert.id);
            if (res.succes) {
                toast.success("Incidencia marcada como resuelta.");
            } else {
                toast.error("Error al resolver la incidencia.");
            }
        } catch {
            toast.error("Error de comunicación.");
        }
    };

    return (
        <tr className={`hover:bg-muted/40 transition-colors bg-card ${alert.resolved ? "opacity-60" : ""}`}>
            <td className="py-4 px-6 text-sm whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${severityStyle}`}>
                    {alert.severity}
                </span>
            </td>

            <td className="py-4 px-6 text-sm max-w-xs">
                <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80 pt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(alert.createdAt || alert.createAt)}
                    </span>
                </div>
            </td>

            <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-muted-foreground" />
                    {alert.topology?.name || "Desconocida"}
                </span>
            </td>

            <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                {alert.user?.username || "Automático (PT)"}
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${alert.resolved
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}>
                    {alert.resolved ? "RESUELTA" : "ACTIVA"}
                </span>
            </td>

            <td className="py-4 px-6 text-sm whitespace-nowrap text-right">
                <div className="flex justify-end gap-1.5">
                    {!alert.resolved && (userRole === "ADMIN" || userRole === "STAFF") && (
                        <button
                            onClick={handleResolve}
                            className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                            title="Resolver Incidencia"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {(userRole === "ADMIN" || userRole === "STAFF") && (
                        <button
                            onClick={() => onEdit(alert)}
                            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-sky-500 hover:border-sky-500/30 transition-all cursor-pointer"
                            title="Auditar Gravedad"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {userRole === "ADMIN" && (
                        <button
                            onClick={() => onDelete(alert.id)}
                            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer"
                            title="Eliminar Registro"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}